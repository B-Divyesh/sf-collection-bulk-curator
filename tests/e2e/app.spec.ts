import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
});
