import { expect, test } from '@playwright/test';
import type { Download, Page } from '@playwright/test';

async function downloadedText(download: Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error('Downloaded file has no local path.');
  return (await import('node:fs/promises')).readFile(path, 'utf8');
}

async function stageFirstSampleLocation(page: Page): Promise<void> {
  await page.locator('[data-select-key]').first().check();
  await page.getByLabel('Field', { exact: true }).selectOption('location');
  await page.getByLabel('New value').fill('Archive room');
  await page.getByRole('button', { name: 'Stage for 1 item' }).click();
}

async function startRealImportFromDemo(page: Page): Promise<void> {
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stage bulk catalog edits before export');
}

test('@claim:sample-catalog @regression:cold-mobile-sample-action keeps the primary sample action in the first 390px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const action = page.getByRole('button', { name: 'Try it with sample data' });
  const box = await action.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? Infinity) + (box?.height ?? 0)).toBeLessThanOrEqual(844);
  await action.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review catalog items');
  await expect(page.locator('.item-card')).toHaveCount(32);
});

test('@claim:local-data demo catalog processing makes only same-origin requests', async ({ page, baseURL }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/?demo=1');
  await stageFirstSampleLocation(page);

  const expectedOrigin = new URL(baseURL!).origin;
  expect(requests.map((request) => new URL(request).origin)).toEqual(expect.arrayContaining([expectedOrigin]));
  expect(requests.every((request) => new URL(request).origin === expectedOrigin)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('collection-bulk-curator:session'))).toBeNull();
});

test('@claim:remote-thumbnails demo keeps remote thumbnails off until the collector opts in', async ({ page }) => {
  await page.route('https://images.example.invalid/sample-vessel.png', (route) => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  }));
  await page.goto('/?demo=1');
  await expect(page.getByText('Remote image off')).toBeVisible();
  const request = page.waitForRequest('https://images.example.invalid/sample-vessel.png');
  await page.getByLabel('Load remote image URLs').check();
  await request;
  await expect(page.locator('.item-image img').first()).toHaveAttribute('src', 'https://images.example.invalid/sample-vessel.png');
});

test('@claim:exact-ids demo patch keeps supplied IDs byte-for-byte', async ({ page }) => {
  await page.goto('/?demo=1');
  await stageFirstSampleLocation(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export patch CSV' }).click();
  expect(await downloadedText(await download)).toBe('\uFEFFID,Location\r\n0001,Archive room\r\n');
});

test('@claim:patch-csv demo exports a patch CSV for staged edits', async ({ page }) => {
  await page.goto('/?demo=1');
  await stageFirstSampleLocation(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export patch CSV' }).click();
  const text = await downloadedText(await download);
  expect(text.split('\r\n')).toEqual(['\uFEFFID,Location', '0001,Archive room', '']);
});

test('@claim:undo-manifest demo exports original values in the undo CSV', async ({ page }) => {
  await page.goto('/?demo=1');
  await stageFirstSampleLocation(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export undo CSV' }).click();
  expect(await downloadedText(await download)).toBe('\uFEFFID,Location\r\n0001,Map drawer\r\n');
});

test('@claim:demo-isolation demo storage never reads or overwrites a real desk session', async ({ page }) => {
  const realSession = JSON.stringify({ fileName: 'real-catalog.csv', marker: 'real-user-data' });
  await page.goto('/');
  await page.evaluate((value) => localStorage.setItem('collection-bulk-curator:session', value), realSession);
  await page.goto('/?demo=1');

  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review catalog items');
  expect(await page.evaluate(() => localStorage.getItem('collection-bulk-curator:session'))).toBe(realSession);
  expect(await page.evaluate(() => localStorage.getItem('demo:collection-bulk-curator:session'))).not.toBeNull();

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.item-card')).toHaveCount(32);
  expect(await page.evaluate(() => localStorage.getItem('collection-bulk-curator:session'))).toBe(realSession);

  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stage bulk catalog edits before export');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('demo:collection-bulk-curator:session'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('collection-bulk-curator:session'))).toBe(realSession);
});

test('@claim:offline-reload @regression:mobile-offline-status demo reloads offline after the first visit with a persistent phone status', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/?demo=1`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    });
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload({ waitUntil: 'networkidle' });
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review catalog items');
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    const offlineStatus = page.getByRole('status');
    await expect(offlineStatus).toBeVisible();
    await expect(offlineStatus).toContainText('Offline · local tools still work');
    expect(await offlineStatus.evaluate((element) => getComputedStyle(element).display)).not.toBe('none');
  } finally {
    await context.close();
  }
});

test('@claim:desk-plus-price shows the advertised one-time Desk Plus offer and checkout route', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('$19 once for Desk Plus')).toBeVisible();
  await page.locator('.license-menu > summary').click();
  await expect(page.getByRole('heading', { name: 'Desk Plus · $19' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/collection-bulk-curator/checkout');
});

test('@claim:desk-plus-session saves a verified workspace immediately and restores it after reload', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/collection-bulk-curator/verify?*', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' })
  }));
  await page.goto('/?license=paid-session-token');
  await expect(page.locator('.license-menu summary span')).toHaveText('Plus active');
  await page.locator('#csv-file').setInputFiles({ name: 'paid.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Location\n0007,Vase,Shelf 2') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('collection-bulk-curator:session'))).not.toBeNull();
  await page.reload();
  await expect(page.getByRole('button', { name: /Resume local desk/ })).toBeVisible();
  await page.getByRole('button', { name: /Resume local desk/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review catalog items');
});

test('@claim:daily-license-check verifies a saved license once during its daily cache window', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/collection-bulk-curator/verify?*', (route) => {
    requests += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/?license=daily-test-token');
  await expect.poll(() => requests).toBe(1);
  await expect(page.locator('.license-menu summary span')).toHaveText('Plus active');
  await page.reload();
  await expect(page.locator('.license-menu summary span')).toHaveText('Plus active');
  expect(requests).toBe(1);
});

test('@claim:license-request-boundary sends only the license token in a GET request with no body or catalog content', async ({ page }) => {
  const licenseToken = 'boundary-token-007';
  const catalogMarker = 'private-catalog-content-must-not-leave';
  let verificationRequest: import('@playwright/test').Request | undefined;
  await page.addInitScript(({ marker }) => {
    localStorage.setItem('collection-bulk-curator:session', JSON.stringify({
      fileName: marker,
      savedAt: 0,
      headers: ['ID', 'Title'],
      sourceRows: [['0007', marker]],
      mapping: { id: 'ID', title: 'Title' },
      changes: {}
    }));
  }, { marker: catalogMarker });
  await page.route('https://api.sociobot.in/api/v1/products/collection-bulk-curator/verify?*', async (route) => {
    verificationRequest = route.request();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });

  await page.goto(`/?license=${encodeURIComponent(licenseToken)}`);
  await expect.poll(() => verificationRequest).toBeDefined();

  const request = verificationRequest!;
  const requestUrl = new URL(request.url());
  const observedRequest = JSON.stringify({ url: request.url(), headers: request.headers(), body: request.postData() });
  expect(request.method()).toBe('GET');
  expect(requestUrl.pathname).toBe('/api/v1/products/collection-bulk-curator/verify');
  expect([...requestUrl.searchParams.entries()]).toEqual([['license', licenseToken]]);
  expect(request.postData()).toBeNull();
  expect(observedRequest).not.toContain(catalogMarker);
  await expect(page).toHaveURL('/');
});

test('@claim:no-tracking uses no third-party runtime request or cookie during the demo flow', async ({ page, context, baseURL }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/?demo=1');
  await stageFirstSampleLocation(page);
  const expectedOrigin = new URL(baseURL!).origin;
  expect(requests).not.toHaveLength(0);
  expect(requests.every((request) => new URL(request).origin === expectedOrigin)).toBe(true);
  expect(await context.cookies()).toEqual([]);
});

test('@claim:csv-heading-mapping maps nonstandard headings to a review desk', async ({ page }) => {
  await startRealImportFromDemo(page);
  await page.locator('#csv-file').setInputFiles({
    name: 'field-notes.csv', mimeType: 'text/csv',
    buffer: Buffer.from('Reference,Artifact,Keywords,Room,Grade,Group\nA-9,Small vessel,ceramic,Case 2,Good,Field notes')
  });
  await page.locator('select[name="id"]').selectOption('Reference');
  await page.locator('select[name="title"]').selectOption('Artifact');
  await page.locator('select[name="tags"]').selectOption('Keywords');
  await page.locator('select[name="location"]').selectOption('Room');
  await page.locator('select[name="condition"]').selectOption('Grade');
  await page.locator('select[name="collection"]').selectOption('Group');
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review catalog items');
  await expect(page.getByRole('heading', { name: 'Small vessel' })).toBeVisible();
});

test('@claim:csv-format-support imports a BOM CSV with quoted commas, escaped quotes, and multiline fields', async ({ page }) => {
  await startRealImportFromDemo(page);
  await page.locator('#csv-file').setInputFiles({
    name: 'quoted.csv', mimeType: 'text/csv',
    buffer: Buffer.from('\uFEFFID,Title,Location\r\n0007,"Cup, blue","Line one\nLine two ""quoted"""\r\n')
  });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review catalog items');
  await expect(page.getByRole('heading', { name: 'Cup, blue' })).toBeVisible();
});

test('@claim:id-validation blocks blank and duplicate IDs before a review desk opens', async ({ page }) => {
  await startRealImportFromDemo(page);
  await page.locator('#csv-file').setInputFiles({ name: 'blank.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title\n   ,No ID') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.locator('.toast')).toContainText('blank ID');

  await startRealImportFromDemo(page);
  await page.locator('#csv-file').setInputFiles({ name: 'duplicate.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title\n0007,Vase\n0007,Cup') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.locator('.toast')).toContainText('Duplicate ID');
});

test('@claim:local-thumbnail-matching attaches a local image by its mapped filename', async ({ page }) => {
  await startRealImportFromDemo(page);
  await page.locator('#csv-file').setInputFiles({ name: 'thumbs.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Image\n0007,Vase,card.png') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await page.locator('#image-files').setInputFiles({
    name: 'card.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  });
  await expect(page.locator('.item-image img')).toHaveAttribute('src', /^blob:/);
});

test('@claim:filter-visible-results @regression:mobile-sequential-search keeps the phone filter drawer usable while narrowing sample cards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const search = page.getByLabel('Search everything');
  await search.pressSequentially('Glazed');

  await expect(search).toHaveValue('Glazed');
  await expect(search).toBeFocused();
  await expect(page.locator('.filters')).toHaveClass(/mobile-open/);
  expect(await page.locator('.filters').evaluate((element) => (element as HTMLElement).inert)).toBe(false);
  await expect(page.locator('.item-card')).toHaveCount(8);
  await expect(page.getByText('8 of 32 items')).toBeVisible();
});

test('@claim:source-rows-unchanged keeps the original source value in the undo CSV', async ({ page }) => {
  await page.goto('/?demo=1');
  await stageFirstSampleLocation(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export undo CSV' }).click();
  expect(await downloadedText(await download)).toContain('0001,Map drawer');
});

test('@claim:free-core-workflow stages and exports a patch without a license', async ({ page }) => {
  await page.goto('/');
  await page.locator('#csv-file').setInputFiles({ name: 'free.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Location\n0007,Vase,Shelf 2') });
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await page.locator('[data-select-key]').check();
  await page.getByLabel('Field', { exact: true }).selectOption('location');
  await page.getByLabel('New value').fill('Archive room');
  await page.getByRole('button', { name: 'Stage for 1 item' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export patch CSV' }).click();
  expect(await downloadedText(await download)).toContain('0007,Archive room');
});
