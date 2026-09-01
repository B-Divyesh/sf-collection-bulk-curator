import { expect, test } from '@playwright/test';
import type { Download } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, resolve } from 'node:path';

const contentTypes: Record<string, string> = {
  '.avif': 'image/avif', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp'
};

async function startPwaUpgradeServer(): Promise<{ url: string; useCurrentBuild: () => void; close: () => Promise<void> }> {
  let root = resolve('tests/fixtures/pwa-v3');
  const currentBuildRoot = resolve('dist');
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
      const relativePath = normalize(decodeURIComponent(pathname === '/' ? '/index.html' : pathname)).replace(/^[/\\]+/, '');
      if (!relativePath || relativePath.startsWith('..') || relativePath.includes('\0')) throw new Error('Unsafe path');
      let file = join(root, relativePath);
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const extension = file.slice(file.lastIndexOf('.'));
      response.writeHead(200, {
        'cache-control': pathname === '/sw.js' ? 'no-cache' : 'no-store',
        'content-type': contentTypes[extension] ?? 'application/octet-stream'
      });
      response.end(await readFile(file));
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });
  await new Promise<void>((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', rejectListen);
      resolveListen();
    });
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('PWA regression server did not receive a TCP port.');
  return {
    url: `http://127.0.0.1:${address.port}`,
    useCurrentBuild: () => { root = currentBuildRoot; },
    close: () => new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()))
  };
}

async function downloadedText(download: Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error('Downloaded file has no local path');
  return readFile(path, 'utf8');
}

test('imports, stages, undoes, and exports a reversible batch', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stage bulk catalog edits safely');
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review catalog items');

  await page.getByRole('button', { name: 'Select visible' }).click();
  await expect(page.getByText('32 selected items')).toBeVisible();
  await page.getByLabel('Field', { exact: true }).selectOption('location');
  await page.getByLabel('New value').fill('Archive room');
  await page.getByRole('button', { name: 'Stage for 32 items' }).click();
  await expect(page.getByText('32', { exact: true }).first()).toBeVisible();

  const patchDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export patch CSV/ }).click();
  expect((await patchDownload).suggestedFilename()).toContain('patch');

  const undoDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export undo CSV/ }).click();
  expect((await undoDownload).suggestedFilename()).toContain('undo');

  await page.getByRole('button', { name: /Undo “location on 32 items”/ }).click();
  await expect(page.getByRole('button', { name: /Export patch CSV/ })).toBeDisabled();
});

test('reports malformed CSV and rejects ambiguous IDs', async ({ page }) => {
  await page.goto('/');
  await page.locator('#csv-file').setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title\n001,A\n001,B') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.locator('.toast')).toContainText('Duplicate ID');
});

test('rejects repeated semantic mappings before an ID can be corrupted', async ({ page }) => {
  await page.goto('/');
  await page.locator('#csv-file').setInputFiles({ name: 'repeated.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Tags\n0007,Vase,ceramic') });
  await page.locator('select[name="tags"]').selectOption('ID');
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.locator('.toast')).toContainText('mapped to both Item ID and Tags');
  await expect(page.getByRole('heading', { name: 'Map your catalog columns' })).toBeVisible();
});

test('blocks whitespace-only IDs while preserving exact IDs in patch and undo bytes', async ({ page }) => {
  await page.goto('/');
  await page.locator('#csv-file').setInputFiles({ name: 'blank.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title\n   ,No usable ID') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.locator('.toast')).toContainText('1 row has a blank ID');

  await page.goto('/');
  await page.locator('#csv-file').setInputFiles({ name: 'safe.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Tags\n0007,Vase,ceramic') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await page.locator('[data-select-key]').check();
  await page.getByLabel('Operation').selectOption('add');
  await page.getByLabel('New value').fill('priority');
  await page.getByRole('button', { name: 'Stage for 1 item' }).click();

  const patchEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export patch CSV/ }).click();
  expect(await downloadedText(await patchEvent)).toBe('\uFEFFID,Tags\r\n0007,"ceramic, priority"\r\n');

  const undoEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export undo CSV/ }).click();
  expect(await downloadedText(await undoEvent)).toBe('\uFEFFID,Tags\r\n0007,ceramic\r\n');
});

test('uses the production Sociobot checkout endpoint by default', async ({ page }) => {
  await page.goto('/');
  await page.locator('.license-menu > summary').click();
  await expect(page.getByRole('link', { name: 'Buy once' })).toHaveAttribute(
    'href',
    'https://api.sociobot.in/api/v1/products/collection-bulk-curator/checkout'
  );
});

test('captures a returned license, caches it for a day, and locks it after revocation', async ({ page }) => {
  let requests = 0;
  let valid = true;
  await page.route('https://api.sociobot.in/api/v1/products/collection-bulk-curator/verify?*', async (route) => {
    requests += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid, reason: valid ? 'ok' : 'revoked' }) });
  });

  await page.goto('/?keep=yes&license=returned-test-token#desk');
  await expect(page).toHaveURL(/\?keep=yes#desk$/);
  await expect.poll(() => requests).toBe(1);
  await expect(page.locator('.license-menu summary span')).toHaveText('Plus active');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:collection-bulk-curator'))).toBe('returned-test-token');

  await page.reload();
  await expect(page.locator('.license-menu summary span')).toHaveText('Plus active');
  expect(requests).toBe(1);

  valid = false;
  await page.evaluate(() => {
    const key = 'sb_license:collection-bulk-curator:verdict';
    const verdict = JSON.parse(localStorage.getItem(key) ?? '{}');
    verdict.checkedAt = 0;
    localStorage.setItem(key, JSON.stringify(verdict));
  });
  await page.reload();
  await expect.poll(() => requests).toBe(2);
  await expect(page.locator('.license-menu summary span')).toHaveText('Desk Plus');
  await page.locator('.license-menu > summary').click();
  await expect(page.getByRole('link', { name: 'Buy once' })).toBeVisible();
});

test('has no serious accessibility violations on import and workspace', async ({ page }) => {
  await page.goto('/');
  let results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Use light theme' }).click();
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#csv-file').setInputFiles({ name: 'accessibility.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Location\n0007,Vase,Shelf 2') });
  results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: /Open review desk/ }).click();
  results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test.describe('390 px accessibility regression coverage', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keeps Desk Plus named while its visible label is compacted', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.license-menu > summary')).toHaveAccessibleName('Desk Plus license options');

    let results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

    await page.getByRole('button', { name: 'Use dark theme' }).click();
    results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

    await page.locator('#csv-file').setInputFiles({ name: 'mobile-accessibility.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title\n0007,Vase') });
    results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

    await page.goto('/?demo=1');
    await expect(page.locator('.license-menu > summary')).toHaveAccessibleName('Desk Plus license options');
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expect(page.locator('.item-card')).toHaveCount(32);
    results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  });

  test('has no serious accessibility violations on legal pages', async ({ page }) => {
    for (const path of ['/privacy/', '/terms/']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page: page as never }).analyze();
      expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    }
  });

  test('keeps mobile navigation targets at least 44px', async ({ page }) => {
    await page.goto('/');
    for (const locator of [page.locator('.brand'), ...await page.locator('footer nav a').all()]) {
      const box = await locator.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    for (const path of ['/privacy/', '/terms/']) {
      await page.goto(path);
      for (const locator of await page.locator('header a').all()) {
        const box = await locator.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test('serves accessible privacy and terms pages', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('updates its service worker and reloads the complete shell offline without errors', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    const worker = registration.installing;
    if (worker) await new Promise<void>((resolve) => worker.addEventListener('statechange', () => {
      if (worker.state === 'activated' || worker.state === 'redundant') resolve();
    }));
  });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Stage bulk catalog edits safely');
  await expect(page.getByRole('status')).toContainText('Offline · local tools still work');
  expect(errors).toEqual([]);
  await context.setOffline(false);
});

test('@regression:pwa-upgrade replaces a persistent v3 client before its offline reload', async ({ browser }) => {
  test.setTimeout(60_000);
  const legacyWorker = await readFile(resolve('tests/fixtures/pwa-v3/sw.js'));
  expect(createHash('sha256').update(legacyWorker).digest('hex')).toBe('5d143fad46a371a15ffffc6a2c407381820928d45cb705456e818d9b80d16618');
  const server = await startPwaUpgradeServer();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(`${server.url}/`, { waitUntil: 'networkidle' });
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload({ waitUntil: 'networkidle' });
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Previous PWA shell');
    expect(await page.evaluate(() => caches.keys())).toEqual(['collection-batch-desk-v3']);

    server.useCurrentBuild();
    const directNetworkHtml = await (await fetch(`${server.url}/`)).text();
    expect(directNetworkHtml).toMatch(/\/assets\/index-[^"]+\.js/);
    expect(directNetworkHtml).not.toContain('Previous PWA shell');

    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) throw new Error('Expected legacy service-worker registration.');
      await registration.update();
    });
    await expect.poll(() => page.evaluate(async () => {
      const keys = await caches.keys();
      return keys.length === 1 && keys[0] !== 'collection-batch-desk-v3' && keys[0]?.startsWith('collection-batch-desk-r');
    })).toBe(true);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Stage bulk catalog edits safely');
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Stage bulk catalog edits safely');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await server.close();
  }
});

test('clears a selection before a changed filter can stage hidden rows', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await page.getByLabel('Collection', { exact: true }).selectOption('Field finds');
  await page.getByRole('button', { name: 'Select visible' }).click();
  await expect(page.getByText('11 selected items')).toBeVisible();

  await page.getByLabel('Collection', { exact: true }).selectOption('Paper archive');
  await expect(page.getByText('0 selected items')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Stage for 0 items' })).toBeDisabled();
  await expect(page.locator('.toast')).toContainText('Selection cleared because the visible results changed');
});

test('keeps logical focus on an item checkbox after keyboard selection', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  const firstCheckbox = page.locator('[data-select-key]').first();
  await firstCheckbox.focus();
  await page.keyboard.press('Space');
  await expect(firstCheckbox).toBeChecked();
  await expect(firstCheckbox).toBeFocused();
});

test('gives transparent CSV and thumbnail inputs a visible label focus ring', async ({ page }) => {
  await page.goto('/');
  await page.locator('#csv-file').focus();
  await expect(page.locator('#drop-zone')).toHaveCSS('outline-style', 'solid');

  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await page.locator('#image-files').focus();
  await expect(page.locator('.file-button')).toHaveCSS('outline-style', 'solid');
});

test('keeps the skip link, sample action, and mobile navigation operable by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();

  await page.getByRole('button', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review catalog items');

  await page.locator('.site-menu summary').focus();
  await page.keyboard.press('Space');
  await expect(page.getByLabel('Mobile primary').getByRole('link', { name: 'Privacy' })).toBeVisible();
});

test('confirmed New catalog clears the saved Desk Plus session', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/collection-bulk-curator/verify?*', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' })
  }));
  await page.goto('/?license=valid-test-token');
  await expect(page.locator('.license-menu summary span')).toHaveText('Plus active');
  await page.locator('#csv-file').setInputFiles({ name: 'saved.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Location\n0007,Vase,Shelf 2') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await page.locator('[data-select-key]').first().check();
  await page.getByLabel('New value').fill('Archive room');
  await page.getByRole('button', { name: 'Stage for 1 item' }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('collection-bulk-curator:session'))).not.toBeNull();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'New catalog' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Stage bulk catalog edits safely');
  expect(await page.evaluate(() => localStorage.getItem('collection-bulk-curator:session'))).toBeNull();
  await expect(page.getByRole('button', { name: /Resume local desk/ })).toHaveCount(0);
});

test('sets complete per-route metadata and ships product-styled legal and 404 pages', async ({ page }) => {
  const routes = [
    { path: '/', title: 'Collection Batch Desk — stage catalog edits safely', canonical: 'https://collection-bulk-curator.sociobot.in/' },
    { path: '/?demo=1', title: 'Demo — Collection Batch Desk', canonical: 'https://collection-bulk-curator.sociobot.in/?demo=1' },
    { path: '/privacy/', title: 'Privacy — Collection Batch Desk', canonical: 'https://collection-bulk-curator.sociobot.in/privacy/' },
    { path: '/terms/', title: 'Terms — Collection Batch Desk', canonical: 'https://collection-bulk-curator.sociobot.in/terms/' },
    { path: '/404.html', title: 'Page not found — Collection Batch Desk', canonical: 'https://collection-bulk-curator.sociobot.in/404.html' }
  ];
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://collection-bulk-curator.sociobot.in/og-image.jpg');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('.skip-link')).toHaveCount(1);
    await expect(page.locator('footer')).toContainText('Built by Param Factory · v1.0.1');
  }
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page was not found');
  const socialSize = await page.evaluate(async () => {
    const response = await fetch('/og-image.jpg');
    const image = await createImageBitmap(await response.blob());
    return { width: image.width, height: image.height };
  });
  expect(socialSize).toEqual({ width: 1200, height: 630 });
});

test('declares the Static Web Apps 404 and security response policy', async () => {
  const config = JSON.parse(await readFile(resolve('public/staticwebapp.config.json'), 'utf8')) as {
    globalHeaders: Record<string, string>;
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
  };
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders['Content-Security-Policy']).toContain("script-src 'self'");
  expect(config.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  expect(config.globalHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
});

test('keeps 390px demo controls at 44px and the selected large workspace within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  for (const control of [page.getByRole('button', { name: 'Reset demo' }), page.getByRole('button', { name: 'Start for real' })]) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const switchBox = await page.locator('.switch-row').boundingBox();
  expect(switchBox?.height).toBeGreaterThanOrEqual(44);
  await page.getByRole('button', { name: 'Close filters' }).click();

  const rows = Array.from({ length: 1_000 }, (_, index) => `${String(index + 1).padStart(4, '0')},Item ${index + 1},Archive`).join('\n');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#csv-file').setInputFiles({ name: 'large.csv', mimeType: 'text/csv', buffer: Buffer.from(`ID,Title,Collection\n${rows}`) });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await page.getByRole('button', { name: 'Select all matching' }).click();
  await expect(page.getByText('1,000 selected items')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('progressively renders a thousand-row catalog while preserving bulk selection', async ({ page }) => {
  const rows = Array.from({ length: 1_000 }, (_, index) => `${String(index + 1).padStart(4, '0')},Item ${index + 1},Archive`).join('\n');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('#csv-file').setInputFiles({ name: 'large.csv', mimeType: 'text/csv', buffer: Buffer.from(`ID,Title,Collection\n${rows}`) });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.locator('.item-card')).toHaveCount(120);
  await expect(page.getByText('Showing 120 of 1,000 matching items.')).toBeVisible();
  const interactionMs = await page.getByRole('button', { name: 'Select all matching' }).evaluate((button) => new Promise<number>((resolve) => {
    const start = performance.now();
    button.addEventListener('click', () => requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - start))), { once: true });
    (button as HTMLButtonElement).click();
  }));
  expect(interactionMs).toBeLessThan(200);
  await expect(page.getByText('1,000 selected items')).toBeVisible();
  await expect(page.locator('.item-card')).toHaveCount(120);
});

test.describe('mobile workspace', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('keeps filters and staging reachable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Try it with sample data' }).click();
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Filter items' })).toBeVisible();
    await page.getByRole('button', { name: 'Close filters' }).click();
    await page.locator('[data-select-key]').first().check();
    await page.getByRole('button', { name: 'Stage changes' }).click();
    await expect(page.getByRole('heading', { name: 'Stage a field' })).toBeVisible();
  });

  test('keeps the mobile staged-change removal target at least 44px and headings in order', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Try it with sample data' }).click();
    await page.locator('[data-select-key]').first().check();
    await page.getByRole('button', { name: 'Stage changes' }).click();
    await page.getByLabel('New value').fill('Archive room');
    await page.getByRole('button', { name: 'Stage for 1 item' }).click();
    const remove = page.locator('[data-remove-change]');
    const box = await remove.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.find((item) => item.id === 'heading-order')).toBeUndefined();
  });

  test('keeps local thumbnail attachment reachable and functional', async ({ page }) => {
    await page.goto('/');
    await page.locator('#csv-file').setInputFiles({ name: 'thumbs.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Image\n0007,Vase,card.png') });
    await page.getByRole('button', { name: /Open review desk/ }).click();
    const attachment = page.getByText('Add thumbnails', { exact: true });
    await expect(attachment).toBeVisible();
    const box = await attachment.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await page.locator('#image-files').setInputFiles({
      name: 'card.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
    });
    await expect(page.locator('.item-image img')).toHaveAttribute('src', /^blob:/);
    await expect.poll(() => page.locator('.item-image img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1);
    await expect(page.locator('.toast')).toContainText('1 local thumbnail attached');
  });
});
