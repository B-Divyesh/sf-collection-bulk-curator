import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile } from 'node:fs/promises';

const base = 'https://collection-bulk-curator.sociobot.in';
const browser = await chromium.launch({ headless: true });
const report = { checkedAt: new Date().toISOString(), base, checks: [], observations: {}, findings: [] };

function confirm(condition, description, detail = undefined) {
  const detailText = detail === undefined ? '' : `: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  if (!condition) throw new Error(`${description}${detailText}`);
  report.checks.push({ description, result: 'PASS', ...(detail === undefined ? {} : { detail }) });
}

async function section(name, task) {
  try {
    await task();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    report.checks.push({ description: name, result: 'FAIL', detail });
    report.findings.push(`${name}: ${detail}`);
  }
}

function observeErrors(page, target) {
  page.on('console', (message) => { if (message.type() === 'error') target.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => target.push(`page: ${error.message}`));
}

async function downloadText(download) {
  const path = await download.path();
  if (!path) throw new Error('The browser did not provide a download path.');
  return readFile(path, 'utf8');
}

await section('Confirm that the live demo completes the reversible bulk-edit workflow.', async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  observeErrors(page, errors);
  page.on('request', (request) => requests.push(request.url()));
  try {
    const response = await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    confirm(response?.status() === 200, 'Confirm that the live start page returns HTTP 200.');
    confirm(await page.getByRole('heading', { level: 1 }).innerText() === 'Stage bulk catalog edits safely', 'Confirm that the cold page names the catalog-editing job.');
    confirm((await page.locator('main').innerText()).includes('For collectors updating a chosen subset'), 'Confirm that the cold page names collectors and their chosen subset.');
    const action = page.getByRole('button', { name: 'Try it with sample data' });
    const box = await action.boundingBox();
    confirm(Boolean(box && box.y + box.height <= 900), 'Confirm that the sample-data action is inside the opening desktop viewport.', box);
    await action.click();
    confirm(await page.locator('.item-card').count() === 32, 'Confirm that one action opens all 32 sample items.');
    confirm(await page.getByText('Demo — sample data, nothing is saved').isVisible(), 'Confirm that the demo isolation banner stays visible.');
    await page.getByLabel('Collection', { exact: true }).selectOption('Field finds');
    confirm(await page.locator('.item-card').count() === 11, 'Confirm that the collection filter narrows the sample to 11 visible items.');
    await page.getByRole('button', { name: 'Select visible' }).click();
    confirm(await page.getByText('11 selected items').isVisible(), 'Confirm that selection reports the exact visible scope.');
    await page.getByLabel('Field', { exact: true }).selectOption('tags');
    await page.getByLabel('Operation').selectOption('add');
    await page.getByLabel('New value').fill('priority, fragile');
    await page.getByRole('button', { name: 'Stage for 11 items' }).click();
    const patchEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export patch CSV' }).click();
    const patch = await downloadText(await patchEvent);
    const undoEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export undo CSV' }).click();
    const undo = await downloadText(await undoEvent);
    const patchLines = patch.split('\r\n').filter(Boolean);
    const undoLines = undo.split('\r\n').filter(Boolean);
    confirm(patchLines.length === 12, 'Confirm that the patch has one heading row and 11 changed rows.', patchLines.length);
    confirm(undoLines.length === 12, 'Confirm that the undo file has one heading row and 11 original rows.', undoLines.length);
    confirm(patch.includes('0001,"uncatalogued, priority, fragile"'), 'Confirm that the patch keeps a zero-padded ID and both added tags.');
    confirm(undo.includes('0001,uncatalogued'), 'Confirm that the undo file keeps the original tag value.');
    await page.locator('[data-action="undo-batch"]').click();
    confirm(await page.getByRole('button', { name: 'Export patch CSV' }).isDisabled(), 'Confirm that batch undo returns the desk to no staged edits.');
    const origins = [...new Set(requests.map((url) => new URL(url).origin))];
    confirm(origins.length === 1 && origins[0] === base, 'Confirm that the complete demo workflow makes only same-origin requests.', origins);
    confirm((await context.cookies()).length === 0, 'Confirm that the complete demo workflow sets no cookies.');
    confirm((await page.evaluate(() => localStorage.getItem('collection-bulk-curator:session'))) === null, 'Confirm that demo use does not write the real workspace key.');
    confirm(errors.length === 0, 'Confirm that the complete demo workflow has no console or page errors.', errors);
    report.observations.demo = { requestCount: requests.length, origins, patchPreview: patchLines.slice(0, 4), undoPreview: undoLines.slice(0, 4) };
    await page.screenshot({ path: '.factory/evidence/verification-8-live/workflow-desktop.png', fullPage: true });
  } finally {
    await context.close();
  }
});

await section('Confirm that invalid catalog files give usable recovery guidance.', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  observeErrors(page, errors);
  const cases = [
    ['empty.csv', Buffer.alloc(0), 'This CSV is empty'],
    ['headings.csv', Buffer.from('ID,Title\n'), 'headings but no item rows'],
    ['quoted.csv', Buffer.from('ID,Title\n0001,"unfinished'), 'ends inside a quoted field'],
    ['large.csv', Buffer.alloc(15 * 1024 * 1024 + 1, 65), 'over 15 MB']
  ];
  try {
    for (const [name, buffer, expected] of cases) {
      await page.goto(`${base}/`);
      await page.locator('#csv-file').setInputFiles({ name, mimeType: 'text/csv', buffer });
      const toast = page.locator('.toast');
      await toast.waitFor({ state: 'visible' });
      const message = await toast.innerText();
      confirm(message.includes(expected), `Confirm that ${name} gives specific recovery guidance.`, message);
    }
    for (const [name, csv, expected] of [
      ['duplicate.csv', 'ID,Title\n0007,Vase\n0007,Cup', 'Duplicate ID'],
      ['blank.csv', 'ID,Title\n   ,No ID', 'blank ID']
    ]) {
      await page.goto(`${base}/`);
      await page.locator('#csv-file').setInputFiles({ name, mimeType: 'text/csv', buffer: Buffer.from(csv) });
      await page.getByRole('button', { name: /Open review desk/ }).click();
      const message = await page.locator('.toast').innerText();
      confirm(message.includes(expected), `Confirm that ${name} is stopped with correction guidance.`, message);
    }
    await page.goto(`${base}/`);
    await page.locator('#csv-file').setInputFiles({
      name: 'recovered.csv', mimeType: 'text/csv',
      buffer: Buffer.from('\uFEFFRef,Artifact,Room,Grade,Group,Keywords\r\n0007,"Cup, blue","Line one\nLine two",Good,Field notes,ceramic\r\n')
    });
    await page.locator('select[name="id"]').selectOption('Ref');
    await page.locator('select[name="title"]').selectOption('Artifact');
    await page.locator('select[name="location"]').selectOption('Room');
    await page.locator('select[name="condition"]').selectOption('Grade');
    await page.locator('select[name="collection"]').selectOption('Group');
    await page.locator('select[name="tags"]').selectOption('Keywords');
    await page.getByRole('button', { name: /Open review desk/ }).click();
    confirm(await page.getByRole('heading', { name: 'Cup, blue' }).isVisible(), 'Confirm that a valid quoted and multiline CSV opens after earlier input errors.');
    await page.locator('[data-select-key]').check();
    await page.getByLabel('Field', { exact: true }).selectOption('condition');
    await page.getByLabel('New value').fill('Excellent');
    await page.getByRole('button', { name: 'Stage for 1 item' }).click();
    const event = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export patch CSV' }).click();
    const patch = await downloadText(await event);
    confirm(patch === '\uFEFFRef,Grade\r\n0007,Excellent\r\n', 'Confirm that recovery preserves the mapped ID and exports exact patch bytes.', JSON.stringify(patch));
    confirm(errors.length === 0, 'Confirm that invalid-input recovery has no console or page errors.', errors);
  } finally {
    await context.close();
  }
});

await section('Confirm that the 390 px keyboard and resize experience stays usable.', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  observeErrors(page, errors);
  try {
    await page.goto(`${base}/`);
    const sample = page.getByRole('button', { name: 'Try it with sample data' });
    const sampleBox = await sample.boundingBox();
    confirm(Boolean(sampleBox && sampleBox.y + sampleBox.height <= 844), 'Confirm that the sample-data action is inside the opening 390 px viewport.', sampleBox);
    await page.keyboard.press('Tab');
    confirm(await page.locator('.skip-link').evaluate((node) => node === document.activeElement), 'Confirm that the skip link is first in keyboard order.');
    const focusStyle = await page.locator('.skip-link').evaluate((node) => ({ style: getComputedStyle(node).outlineStyle, width: getComputedStyle(node).outlineWidth }));
    confirm(focusStyle.style !== 'none' && focusStyle.width !== '0px', 'Confirm that keyboard focus has a visible outline.', focusStyle);
    await page.keyboard.press('Enter');
    confirm(await page.locator('#main').evaluate((node) => node === document.activeElement), 'Confirm that the skip link moves focus to main content.');
    let reachedSample = false;
    for (let i = 0; i < 16; i += 1) {
      await page.keyboard.press('Tab');
      if (await sample.evaluate((node) => node === document.activeElement)) { reachedSample = true; break; }
    }
    confirm(reachedSample, 'Confirm that keyboard navigation reaches the sample-data action.');
    await page.keyboard.press('Enter');
    confirm(await page.locator('.item-card').count() === 32, 'Confirm that Enter opens the sample workspace.');
    const checkbox = page.locator('[data-select-key]').first();
    await checkbox.focus();
    await page.keyboard.press('Space');
    confirm(await checkbox.isChecked() && await checkbox.evaluate((node) => node === document.activeElement), 'Confirm that Space selects an item and retains focus.');
    const filters = page.getByRole('button', { name: 'Filters', exact: true });
    await filters.focus();
    await page.keyboard.press('Enter');
    confirm(await page.locator('#search').evaluate((node) => node === document.activeElement), 'Confirm that opening filters places focus in the filter panel.');
    await page.keyboard.press('Escape');
    confirm(await filters.evaluate((node) => node === document.activeElement), 'Confirm that Escape closes filters and returns focus.');
    const stage = page.getByRole('button', { name: 'Stage changes' });
    await stage.focus();
    await page.keyboard.press('Enter');
    confirm(await page.locator('#stage-field').evaluate((node) => node === document.activeElement), 'Confirm that opening staged changes places focus on its first field.');
    await page.keyboard.press('Escape');
    confirm(await stage.evaluate((node) => node === document.activeElement), 'Confirm that Escape closes staged changes and returns focus.');
    const undersized = await page.evaluate(() => [...document.querySelectorAll('a,button,select,summary,input')].flatMap((node) => {
      const style = getComputedStyle(node); if (style.display === 'none' || style.visibility === 'hidden') return [];
      let target = node; if (node instanceof HTMLInputElement && ['checkbox', 'file'].includes(node.type)) target = node.closest('label') || node;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return [];
      return rect.width < 44 || rect.height < 44 ? [{ name: node.getAttribute('aria-label') || node.textContent?.trim() || node.id, width: rect.width, height: rect.height }] : [];
    }));
    confirm(undersized.length === 0, 'Confirm that visible mobile controls have 44 px effective targets.', undersized);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    await page.screenshot({ path: '.factory/evidence/verification-8-live/workflow-mobile-200-percent.png', fullPage: true });
    confirm(dimensions.scrollWidth <= dimensions.clientWidth, 'Confirm that the mobile workspace has no horizontal overflow at 200% root text size.', dimensions);
    confirm(errors.length === 0, 'Confirm that keyboard and resize checks have no console or page errors.', errors);
  } finally {
    await context.close();
  }
});

await section('Confirm that reduced-motion mode removes meaningful interface motion.', async () => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.goto(`${base}/?demo=1`);
    const timing = await page.evaluate(() => {
      const seconds = (value) => value.split(',').map((part) => part.trim()).map((part) => part.endsWith('ms') ? Number.parseFloat(part) / 1000 : Number.parseFloat(part) || 0);
      let maxTransition = 0; let maxAnimation = 0;
      for (const node of document.querySelectorAll('*')) {
        const style = getComputedStyle(node);
        maxTransition = Math.max(maxTransition, ...seconds(style.transitionDuration));
        maxAnimation = Math.max(maxAnimation, ...seconds(style.animationDuration));
      }
      return { maxTransition, maxAnimation };
    });
    confirm(timing.maxTransition <= 0.001 && timing.maxAnimation <= 0.001, 'Confirm that reduced-motion mode limits all motion to effectively instant changes.', timing);
  } finally {
    await context.close();
  }
});

await section('Confirm that live routes have sound structure and no serious or critical Axe findings.', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const routeResults = [];
  try {
    for (const route of ['/', '/?demo=1', '/privacy/', '/terms/', '/qa-not-found-verification-8']) {
      const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      if (route === '/') await page.getByRole('button', { name: 'Use dark theme' }).click();
      const axe = await new AxeBuilder({ page }).analyze();
      const important = axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''));
      const structure = await page.evaluate(() => ({ title: document.title, lang: document.documentElement.lang, h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main').length, imagesMissingAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length }));
      routeResults.push({ route, status: response?.status(), structure, seriousOrCritical: important.map((item) => item.id) });
      confirm(structure.title.length > 0 && structure.lang === 'en' && structure.h1 === 1 && structure.main === 1 && structure.imagesMissingAlt === 0, `Confirm that ${route} has a title, English language, one h1, one main, and complete image alternatives.`, structure);
      confirm(important.length === 0, `Confirm that ${route} has no serious or critical Axe findings.`, important.map((item) => item.id));
      if (route.includes('not-found')) confirm(response?.status() === 404 && structure.title === 'Page not found — Collection Batch Desk', 'Confirm that an unknown route returns the styled HTTP 404 page.', { status: response?.status(), title: structure.title });
    }
    report.observations.routes = routeResults;
  } finally {
    await context.close();
  }
});

await section('Confirm that the live service worker supports a populated offline reload.', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  observeErrors(page, errors);
  try {
    await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); });
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload({ waitUntil: 'networkidle' });
    confirm(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), 'Confirm that the live page is controlled by its service worker.');
    const cacheNames = await page.evaluate(() => caches.keys());
    confirm(cacheNames.length === 1 && cacheNames[0].includes('r1e5f284a1dfa'), 'Confirm that the live cache identifies the candidate commit.', cacheNames);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    confirm(await page.locator('.item-card').count() === 32, 'Confirm that the populated demo reloads with all 32 items offline.');
    const status = page.getByRole('status');
    const statusDetails = { visible: await status.isVisible(), text: await status.innerText(), display: await status.evaluate((node) => getComputedStyle(node).display) };
    confirm(statusDetails.visible && statusDetails.text.includes('Offline') && statusDetails.display !== 'none', 'Confirm that the 390 px offline state remains visible after reload.', statusDetails);
    confirm(errors.length === 0, 'Confirm that offline reload has no console or page errors.', errors);
    report.observations.offline = { cacheNames, status: statusDetails };
    await page.screenshot({ path: '.factory/evidence/verification-8-live/offline-mobile.png', fullPage: true });
    await context.setOffline(false);
  } finally {
    await context.close();
  }
});

await browser.close();
await writeFile('.factory/evidence/verification-8-live/live-qa.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (report.findings.length) process.exitCode = 1;
