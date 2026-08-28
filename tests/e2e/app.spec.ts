import { expect, test } from '@playwright/test';
import type { Download } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function downloadedText(download: Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error('Downloaded file has no local path');
  return readFile(path, 'utf8');
}

test('imports, stages, undoes, and exports a reversible batch', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Change the right items/);
  await page.getByRole('button', { name: /Try a 32-item sample/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Map your catalog columns');
  await page.getByRole('button', { name: /Open review desk/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review the territory');

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
  await page.getByRole('button', { name: /Try a 32-item sample/ }).click();
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

    await page.getByRole('button', { name: /Try a 32-item sample/ }).click();
    await expect(page.locator('.license-menu > summary')).toHaveAccessibleName('Desk Plus license options');
    const sourcePreview = page.getByLabel('Scrollable source preview table');
    await expect(sourcePreview).toHaveAttribute('tabindex', '0');
    await sourcePreview.focus();
    await expect(sourcePreview).toBeFocused();
    results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

    await page.getByRole('button', { name: /Open review desk/ }).click();
    await expect(page.locator('.license-menu > summary')).toHaveAccessibleName('Desk Plus license options');
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
      const box = await page.locator('header a').boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
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

test.describe('mobile workspace', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('keeps filters and staging reachable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Try a 32-item sample/ }).click();
    await page.getByRole('button', { name: /Open review desk/ }).click();
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Filter items' })).toBeVisible();
    await page.getByRole('button', { name: 'Close filters' }).click();
    await page.locator('[data-select-key]').first().check();
    await page.getByRole('button', { name: 'Stage changes' }).click();
    await expect(page.getByRole('heading', { name: 'Stage a field' })).toBeVisible();
  });

  test('keeps local thumbnail attachment reachable and functional', async ({ page }) => {
    await page.goto('/');
    await page.locator('#csv-file').setInputFiles({ name: 'thumbs.csv', mimeType: 'text/csv', buffer: Buffer.from('ID,Title,Image\n0007,Vase,card.png') });
    await page.getByRole('button', { name: /Open review desk/ }).click();
    const attachment = page.getByText('Add thumbnails', { exact: true });
    await expect(attachment).toBeVisible();
    const box = await attachment.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await page.locator('#image-files').setInputFiles({ name: 'card.png', mimeType: 'image/png', buffer: Buffer.from('local image bytes') });
    await expect(page.locator('.item-image img')).toHaveAttribute('src', /^blob:/);
    await expect(page.locator('.toast')).toContainText('1 local thumbnail attached');
  });
});
