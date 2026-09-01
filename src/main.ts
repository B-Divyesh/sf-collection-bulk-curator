import './styles.css';
import { parseCsv, suggestColumn, toCsv, type ParsedCsv } from './csv';
import { buildChangeExport, mappingConflict, unsafeIdCount } from './catalog';
import { editableFields, type CatalogRow, type ChangeBatch, type ColumnMap, type EditableField, type FieldChange, type RowChanges } from './types';

const PRODUCT_SLUG = 'collection-bulk-curator';
const PRODUCT_NAME = 'Collection Batch Desk';
const PRODUCT_VERSION = 'v1.0.1';
const SITE_URL = 'https://collection-bulk-curator.sociobot.in';
const BILLING_BASE = import.meta.env.VITE_BILLING_API_BASE || 'https://api.sociobot.in/api/v1';
const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
const SESSION_KEY = `${PRODUCT_SLUG}:session`;
const DEMO_SESSION_KEY = `demo:${PRODUCT_SLUG}:session`;
const CATALOG_PAGE_SIZE = 120;

type Screen = 'import' | 'mapping' | 'workspace';
type Theme = 'light' | 'dark';

interface LicenseVerdict { valid: boolean; checkedAt: number; reason?: string }
interface SavedSession {
  savedAt: number;
  fileName: string;
  headers: string[];
  sourceRows: Record<string, string>[];
  mapping: ColumnMap;
  changes: Record<string, RowChanges>;
}
interface DemoSession extends SavedSession { batches: ChangeBatch[] }

const state = {
  screen: 'import' as Screen,
  fileName: '',
  parsed: null as ParsedCsv | null,
  mapping: null as ColumnMap | null,
  rows: [] as CatalogRow[],
  selection: new Set<string>(),
  changes: {} as Record<string, RowChanges>,
  batches: [] as ChangeBatch[],
  renderLimit: CATALOG_PAGE_SIZE,
  query: '',
  filters: { location: '', condition: '', collection: '', staged: '' },
  localImages: new Map<string, string>(),
  remoteImages: false,
  notice: '',
  licenseValid: false,
  licenseChecking: false,
  online: navigator.onLine,
  theme: (localStorage.getItem('cbd-theme') as Theme | null) ?? 'light',
  demo: (() => { const url = new URL(location.href); return url.searchParams.get('demo') === '1' || url.pathname === '/demo'; })()
};

const app = document.querySelector<HTMLDivElement>('#app')!;
document.documentElement.dataset.theme = state.theme;

function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);
}

function icon(name: 'pin' | 'layers' | 'route' | 'undo' | 'download' | 'filter' | 'moon' | 'sun' | 'lock' | 'check' | 'image' | 'menu'): string {
  const paths = {
    pin: '<path d="M12 21s6-5.1 6-12a6 6 0 1 0-12 0c0 6.9 6 12 6 12Z"/><circle cx="12" cy="9" r="2"/>',
    layers: '<path d="m12 3-9 5 9 5 9-5-9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    route: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h4a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8"/>',
    undo: '<path d="M9 7 4 12l5 5"/><path d="M20 17a7 7 0 0 0-7-7H4"/>',
    download: '<path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/>',
    filter: '<path d="M4 5h16M7 12h10m-7 7h4"/>',
    moon: '<path d="M20 15.4A8 8 0 0 1 8.6 4 8 8 0 1 0 20 15.4Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function shell(content: string): string {
  return `
    <div class="contour-bg" aria-hidden="true"></div>
    <header class="site-header">
      <a class="brand" href="/" data-action="home" aria-label="Collection Batch Desk, start page">
        <span class="brand-mark">${icon('layers')}</span>
        <span><strong>Collection Batch Desk</strong><small>Reversible catalog fieldwork</small></span>
      </a>
      <div class="header-actions">
        <nav class="desktop-nav" aria-label="Primary"><a href="/?demo=1">Demo</a><a href="/#how-it-works">How it works</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
        <details class="site-menu">
          <summary aria-label="Site navigation">${icon('menu')}</summary>
          <nav aria-label="Mobile primary"><a href="/?demo=1">Demo</a><a href="/#how-it-works">How it works</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
        </details>
        <span class="offline-chip ${state.online ? 'is-hidden' : ''}" role="status">Offline · local tools still work</span>
        <button class="icon-button" type="button" data-action="theme" aria-label="Use ${state.theme === 'light' ? 'dark' : 'light'} theme">${icon(state.theme === 'light' ? 'moon' : 'sun')}</button>
        <details class="license-menu">
          <summary aria-label="Desk Plus license options">${state.licenseValid ? icon('check') : icon('lock')} <span>${state.licenseValid ? 'Plus active' : 'Desk Plus'}</span></summary>
          ${licensePanel()}
        </details>
      </div>
    </header>
    ${state.demo ? `<aside class="demo-banner" aria-label="Demo mode"><p><b>Demo — sample data, nothing is saved</b><small>The sample stays separate from your real desk.</small></p><div><button class="text-button" type="button" data-action="reset-demo">Reset demo</button><button class="button secondary" type="button" data-action="start-real">Start for real</button></div></aside>` : ''}
    <main id="main" tabindex="-1">${content}</main>
    <footer>
      <span>Your catalog stays in this browser. Generated field-desk illustration.</span>
      <nav aria-label="Footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-collection-bulk-curator" rel="noreferrer">Source</a></nav>
      <span class="build-id">Built by Param Factory · ${PRODUCT_VERSION}</span>
    </footer>
    <div class="toast" aria-live="polite" aria-atomic="true">${esc(state.notice)}</div>`;
}

function licensePanel(): string {
  return `<div class="license-panel">
    <p class="eyebrow">One-time field kit</p>
    <h2>Desk Plus · $19</h2>
    <p>Automatically save and restore your local workspace next visit. Core review, undo, and both exports stay free.</p>
    ${state.licenseValid
      ? `<p class="success-note">${icon('check')} License verified on this device.</p><button type="button" class="text-button" data-action="forget-license">Remove license</button>`
      : `<a class="button primary full" href="${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout" target="_blank" rel="noreferrer">Buy once</a>
        <form id="license-form"><label for="license-token">Have a license?</label><div class="inline-form"><input id="license-token" autocomplete="off" required placeholder="Paste license token"><button class="button secondary" type="submit" aria-label="Verify license">Verify</button></div></form>
        <p class="micro">Secure checkout by Sociobot / Dodo. Refunds are handled by the merchant of record.</p>`}
  </div>`;
}

function importScreen(): string {
  const saved = readSavedSession();
  return shell(`<section class="hero" aria-labelledby="page-title">
    <div class="hero-copy">
      <p class="eyebrow"><span>01</span> Start</p>
      <h1 id="page-title">Stage bulk catalog edits safely</h1>
      <p class="lede">For collectors updating a chosen subset without losing the original catalog.</p>
      <div class="hero-actions"><button class="button primary" type="button" data-action="demo">Try it with sample data</button><p>Loads 32 sample items in the review desk.</p></div>
      <div class="trust-row"><span>${icon('lock')} Catalog stays in your browser</span><span>${icon('route')} Works offline after first visit</span><span>${icon('lock')} $19 once for Desk Plus</span></div>
      ${saved && state.licenseValid ? `<button type="button" class="saved-session" data-action="restore-session"><span><b>Resume local desk</b><small>${esc(saved.fileName)} · saved ${new Date(saved.savedAt).toLocaleString()}</small></span><span aria-hidden="true">→</span></button>` : ''}
    </div>
    <figure class="hero-art">
      <picture>
        <source type="image/avif" srcset="/assets/survey-desk-640.avif 640w, /assets/survey-desk.avif 1200w" sizes="(max-width: 760px) 92vw, 48vw">
        <source type="image/webp" srcset="/assets/survey-desk-640.webp 640w, /assets/survey-desk.webp 1200w" sizes="(max-width: 760px) 92vw, 48vw">
        <img src="/assets/survey-desk.webp" width="1200" height="800" alt="Illustrated survey desk with a contour map, specimen cards, red pins, and a change ledger" fetchpriority="high" decoding="async">
      </picture>
      <figcaption>Illustration of a local catalog review desk.</figcaption>
    </figure>
    <section class="import-panel" aria-labelledby="import-heading">
      <div><p class="eyebrow"><span>02</span> Import</p><h2 id="import-heading">Choose your catalog CSV</h2><p>Map columns, stage changes, then export a patch CSV and undo CSV.</p></div>
      <label class="drop-zone" id="drop-zone">
        <input id="csv-file" type="file" accept=".csv,text/csv" />
        <span class="drop-icon">${icon('download')}</span><strong>Drop CSV here or browse</strong><small>UTF-8 CSV · first row must be headings</small>
      </label>
      <div class="import-aside">
        <p><b>Optional thumbnails</b><br>Select image files after the CSV. They are matched by filename and stay local.</p>
      </div>
    </section>
  </section>
  <section class="method" id="how-it-works" aria-labelledby="method-title">
    <p class="eyebrow">How it works</p><h2 id="method-title">Review, stage, and export</h2>
    <ol><li><span>01</span><div><b>Filter items</b><p>Search titles and IDs. Then filter collection, location, or condition.</p></div></li><li><span>02</span><div><b>Stage field changes</b><p>Select visible items. Stage one field at a time. Source rows stay unchanged.</p></div></li><li><span>03</span><div><b>Export both files</b><p>Export a patch CSV and an undo CSV with the original values.</p></div></li></ol>
  </section>`);
}

function mappingScreen(): string {
  const parsed = state.parsed!;
  const defaults: ColumnMap = state.mapping ?? {
    id: suggestColumn(parsed.headers, ['id', 'item id', 'item_id', 'uuid', 'identifier']),
    title: suggestColumn(parsed.headers, ['title', 'name', 'item', 'item name']),
    image: suggestColumn(parsed.headers, ['image', 'image url', 'image_url', 'thumbnail', 'photo', 'filename']),
    tags: suggestColumn(parsed.headers, ['tags', 'tag', 'labels']),
    location: suggestColumn(parsed.headers, ['location', 'place', 'storage location']),
    condition: suggestColumn(parsed.headers, ['condition', 'state', 'grade']),
    collection: suggestColumn(parsed.headers, ['collection', 'category', 'group'])
  };
  state.mapping = defaults;
  const optionList = (value: string, optional = true) => `${optional ? '<option value="">Not included</option>' : '<option value="">Choose a column</option>'}${parsed.headers.map((header) => `<option value="${esc(header)}" ${header === value ? 'selected' : ''}>${esc(header)}</option>`).join('')}`;
  const sample = parsed.rows.slice(0, 3);
  return shell(`<section class="map-page" aria-labelledby="page-title">
    <div class="section-heading"><div><p class="eyebrow"><span>02</span> Map columns</p><h1 id="page-title">Map your catalog columns</h1><p>Choose the headings for IDs and editable details.</p></div><button class="button text-button" data-action="back-import">← Choose another file</button></div>
    <form id="mapping-form" class="mapping-grid">
      <label><span>Item ID <b>Required</b></span><select name="id" required>${optionList(defaults.id, false)}</select><small>Exported exactly as supplied, including leading zeros.</small></label>
      <label><span>Display title</span><select name="title">${optionList(defaults.title)}</select></label>
      <label><span>Thumbnail filename or URL</span><select name="image">${optionList(defaults.image)}</select></label>
      <label><span>Tags</span><select name="tags">${optionList(defaults.tags)}</select></label>
      <label><span>Location</span><select name="location">${optionList(defaults.location)}</select></label>
      <label><span>Condition</span><select name="condition">${optionList(defaults.condition)}</select></label>
      <label><span>Collection</span><select name="collection">${optionList(defaults.collection)}</select></label>
      <div class="mapping-submit"><p>${parsed.rows.length.toLocaleString()} rows detected in <b>${esc(state.fileName)}</b>.</p><button class="button primary" type="submit">Open review desk →</button></div>
    </form>
    <section class="sample-table" aria-labelledby="sample-title"><h2 id="sample-title">Source preview</h2><div class="table-scroll" tabindex="0" aria-label="Scrollable source preview table"><table><thead><tr>${parsed.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${sample.map((row) => `<tr>${parsed.headers.map((h) => `<td>${esc(row[h])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
  </section>`);
}

function currentValue(row: CatalogRow, field: EditableField): string {
  return state.changes[row.key]?.[field]?.after ?? row[field];
}

function uniqueValues(field: 'location' | 'condition' | 'collection'): string[] {
  return [...new Set(state.rows.map((row) => currentValue(row, field)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function visibleRows(): CatalogRow[] {
  const query = state.query.trim().toLocaleLowerCase();
  return state.rows.filter((row) => {
    const haystack = `${row.id} ${row.title} ${currentValue(row, 'tags')} ${currentValue(row, 'location')} ${currentValue(row, 'condition')} ${currentValue(row, 'collection')}`.toLocaleLowerCase();
    if (query && !haystack.includes(query)) return false;
    for (const field of ['location', 'condition', 'collection'] as const) {
      if (state.filters[field] && currentValue(row, field) !== state.filters[field]) return false;
    }
    if (state.filters.staged === 'changed' && !state.changes[row.key]) return false;
    if (state.filters.staged === 'unchanged' && state.changes[row.key]) return false;
    return true;
  });
}

function valueOptions(field: 'location' | 'condition' | 'collection'): string {
  return `<option value="">All ${field}s</option>${uniqueValues(field).map((value) => `<option ${state.filters[field] === value ? 'selected' : ''} value="${esc(value)}">${esc(value)}</option>`).join('')}`;
}

function thumbnail(row: CatalogRow): string {
  const exact = state.localImages.get(row.image) ?? state.localImages.get(row.image.split(/[\\/]/).pop() ?? '');
  const remote = state.remoteImages && /^https?:\/\//i.test(row.image) ? row.image : '';
  if (exact || remote) return `<img src="${esc(exact || remote)}" alt="" loading="lazy" decoding="async" width="160" height="120">`;
  return `<span class="image-empty">${icon('image')}<small>${row.image && !state.remoteImages && /^https?:/i.test(row.image) ? 'Remote image off' : 'No local image'}</small></span>`;
}

function itemCard(row: CatalogRow): string {
  const selected = state.selection.has(row.key);
  const changes = state.changes[row.key];
  const changeCount = changes ? Object.keys(changes).length : 0;
  return `<article class="item-card ${selected ? 'selected' : ''}" data-key="${esc(row.key)}">
    <label class="item-select"><input type="checkbox" data-select-key="${esc(row.key)}" ${selected ? 'checked' : ''}><span class="sr-only">Select ${esc(row.title || `item ${row.id}`)}</span></label>
    <div class="item-image">${thumbnail(row)}${changeCount ? `<span class="change-flag" title="${changeCount} staged field${changeCount === 1 ? '' : 's'}">${changeCount}</span>` : ''}</div>
    <div class="item-info"><p class="coord">ROW ${String(row.sourceIndex + 2).padStart(4, '0')} · ID ${esc(row.id)}</p><h3>${esc(row.title || 'Untitled item')}</h3>
      <dl><div><dt>Collection</dt><dd>${esc(currentValue(row, 'collection') || '—')}</dd></div><div><dt>Location</dt><dd>${esc(currentValue(row, 'location') || '—')}</dd></div><div><dt>Condition</dt><dd>${esc(currentValue(row, 'condition') || '—')}</dd></div></dl>
      <div class="tag-line">${currentValue(row, 'tags').split(/[;,]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 4).map((tag) => `<span>${esc(tag)}</span>`).join('') || '<span class="muted-tag">No tags</span>'}</div>
    </div>
  </article>`;
}

function workspaceScreen(): string {
  const visible = visibleRows();
  const rendered = visible.slice(0, state.renderLimit);
  const changedRows = Object.keys(state.changes).length;
  const changedFields = Object.values(state.changes).reduce((sum, fields) => sum + Object.keys(fields).length, 0);
  return shell(`<section class="workspace" aria-labelledby="page-title">
    <div class="workspace-title"><div><p class="eyebrow"><span>03</span> Review desk · ${esc(state.fileName)}</p><h1 id="page-title">Review catalog items</h1></div><div class="desk-actions"><label class="button secondary file-button">${icon('image')} Add thumbnails<input id="image-files" type="file" accept="image/*" multiple></label><button class="button text-button" data-action="new-catalog">New catalog</button></div></div>
    <aside class="filters" aria-labelledby="filter-title"><div class="rail-heading"><span>${icon('filter')}</span><div><p class="eyebrow">Filters</p><h2 id="filter-title">Filter items</h2></div><button class="icon-button mobile-only" data-action="close-filters" aria-label="Close filters">×</button></div>
      <label for="search">Search everything</label><input id="search" type="search" value="${esc(state.query)}" placeholder="Title, ID, tag…">
      <label for="collection-filter">Collection</label><select id="collection-filter" data-filter="collection">${valueOptions('collection')}</select>
      <label for="location-filter">Location</label><select id="location-filter" data-filter="location">${valueOptions('location')}</select>
      <label for="condition-filter">Condition</label><select id="condition-filter" data-filter="condition">${valueOptions('condition')}</select>
      <label for="staged-filter">Change state</label><select id="staged-filter" data-filter="staged"><option value="">All items</option><option value="changed" ${state.filters.staged === 'changed' ? 'selected' : ''}>Staged only</option><option value="unchanged" ${state.filters.staged === 'unchanged' ? 'selected' : ''}>Unchanged only</option></select>
      <label class="switch-row"><input id="remote-images" type="checkbox" ${state.remoteImages ? 'checked' : ''}><span>Load remote image URLs</span></label><p class="micro">Off by default. Turning this on contacts the image hosts in your CSV.</p>
      <button class="button text-button full" data-action="clear-filters">Clear filters</button>
    </aside>
    <section class="catalog" aria-labelledby="catalog-title">
      <h2 id="catalog-title" class="catalog-heading">Catalog items</h2>
      <div class="catalog-toolbar"><div><button class="button secondary mobile-only" data-action="open-filters">${icon('filter')} Filters</button><p><b>${visible.length.toLocaleString()}</b> of ${state.rows.length.toLocaleString()} items</p></div><div><button class="text-button" data-action="select-visible">Select visible</button>${visible.length > rendered.length ? `<button class="text-button" data-action="select-matching">Select all matching</button>` : ''}<button class="text-button" data-action="clear-selection" ${state.selection.size ? '' : 'disabled'}>Clear</button></div></div>
      ${visible.length ? `<p class="rendered-count">Showing ${rendered.length.toLocaleString()} of ${visible.length.toLocaleString()} matching items. ${visible.length > rendered.length ? 'Load more to inspect additional items before selecting them.' : ''}</p><div class="item-grid">${rendered.map(itemCard).join('')}</div>${visible.length > rendered.length ? `<button class="button secondary load-more" data-action="load-more">Show ${Math.min(CATALOG_PAGE_SIZE, visible.length - rendered.length).toLocaleString()} more items</button>` : ''}` : `<div class="empty-results">${icon('route')}<h2>No items match these filters</h2><p>Clear a filter or search for a broader term. Staged edits are still safe.</p><button class="button secondary" data-action="clear-filters">Clear filters</button></div>`}
    </section>
    <aside class="ledger" aria-labelledby="ledger-title"><div class="rail-heading"><span>${icon('layers')}</span><div><p class="eyebrow">Changes</p><h2 id="ledger-title">Stage a field</h2></div><button class="icon-button compact-only" data-action="close-ledger" aria-label="Close change ledger">×</button></div>
      <p class="selection-count"><b>${state.selection.size.toLocaleString()}</b> selected item${state.selection.size === 1 ? '' : 's'}</p>
      <form id="stage-form">
        <label for="stage-field">Field</label><select id="stage-field" name="field">${editableFields.map((field) => `<option value="${field}">${field[0]?.toUpperCase()}${field.slice(1)}</option>`).join('')}</select>
        <label for="stage-operation">Operation</label><select id="stage-operation" name="operation"><option value="set">Set value</option><option value="add">Add tag(s)</option><option value="remove">Remove tag(s)</option><option value="clear">Clear value</option></select>
        <label for="stage-value">New value</label><input id="stage-value" name="value" placeholder="e.g. Cabinet B · Shelf 2"><p class="field-help" id="field-help">Tags can be separated with commas.</p>
        <button class="button signal full" type="submit" ${state.selection.size ? '' : 'disabled'}>Stage for ${state.selection.size || 0} item${state.selection.size === 1 ? '' : 's'}</button>
      </form>
      <div class="ledger-summary"><div><span>Changed rows</span><b>${changedRows}</b></div><div><span>Field edits</span><b>${changedFields}</b></div></div>
      ${state.batches.length ? `<button class="button secondary full" data-action="undo-batch">${icon('undo')} Undo “${esc(state.batches.at(-1)?.label)}”</button>` : ''}
      <div class="ledger-list">${Object.entries(state.changes).slice(-8).reverse().map(([key, fields]) => { const row = state.rows.find((item) => item.key === key)!; return `<div class="ledger-entry"><div><b>${esc(row.title || row.id)}</b><small>ID ${esc(row.id)} · ${Object.keys(fields).join(', ')}</small></div><button class="icon-button" data-remove-change="${esc(key)}" aria-label="Remove all staged changes for ${esc(row.title || row.id)}">×</button></div>`; }).join('')}${changedRows > 8 ? `<p class="micro">+ ${changedRows - 8} more changed rows</p>` : ''}</div>
      <div class="export-zone"><p class="eyebrow"><span>04</span> Export files</p><button class="button primary full" data-action="export-patch" ${changedRows ? '' : 'disabled'}>${icon('download')} Export patch CSV</button><button class="button secondary full" data-action="export-undo" ${changedRows ? '' : 'disabled'}>${icon('undo')} Export undo CSV</button><p>Exports contain only item ID and changed fields. The undo file contains original values.</p></div>
    </aside>
    ${state.selection.size ? `<div class="mobile-selection"><span><b>${state.selection.size}</b> selected</span><button class="button signal" data-action="open-ledger">Stage changes</button></div>` : ''}
  </section>`);
}

function focusSelector(element: Element | null = document.activeElement): string | null {
  if (!(element instanceof HTMLElement)) return null;
  if (element.id) return `#${CSS.escape(element.id)}`;
  const selectionKey = element.dataset.selectKey;
  if (selectionKey) return `[data-select-key="${CSS.escape(selectionKey)}"]`;
  const action = element.dataset.action;
  if (action) return `[data-action="${CSS.escape(action)}"]`;
  const filter = element.dataset.filter;
  if (filter) return `[data-filter="${CSS.escape(filter)}"]`;
  return null;
}

function setMeta(selector: string, content: string): void {
  document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

function updateMetadata(): void {
  const screenTitle = state.demo
    ? `Demo — ${PRODUCT_NAME}`
    : state.screen === 'mapping'
      ? `${PRODUCT_NAME} — map catalog columns`
      : state.screen === 'workspace'
        ? `${PRODUCT_NAME} — review catalog items`
        : `${PRODUCT_NAME} — stage catalog edits safely`;
  const description = state.demo
    ? 'Try a 32-item sample catalog. Stage reversible edits, then export patch and undo CSV files.'
    : 'Review and stage reversible collection edits locally, then export a patch CSV and undo manifest.';
  const url = new URL(location.href);
  if (state.demo) url.searchParams.set('demo', '1');
  else url.searchParams.delete('demo');
  url.searchParams.delete('license');
  document.title = screenTitle;
  document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}${url.pathname}${url.search}`);
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', screenTitle);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', `${SITE_URL}${url.pathname}${url.search}`);
  setMeta('meta[name="twitter:title"]', screenTitle);
  setMeta('meta[name="twitter:description"]', description);
}

function render(restoreFocus = focusSelector()): void {
  app.innerHTML = state.screen === 'import' ? importScreen() : state.screen === 'mapping' ? mappingScreen() : workspaceScreen();
  updateMetadata();
  bindCommon();
  if (state.screen === 'import') bindImport();
  if (state.screen === 'mapping') bindMapping();
  if (state.screen === 'workspace') bindWorkspace();
  if (restoreFocus) requestAnimationFrame(() => document.querySelector<HTMLElement>(restoreFocus)?.focus());
}

function announce(message: string): void {
  state.notice = message;
  const toast = document.querySelector<HTMLElement>('.toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3200);
  }
}

function sampleCatalog(): ParsedCsv {
  const conditions = ['Excellent', 'Good', 'Needs care'];
  const locations = ['Map drawer', 'Cabinet B', 'Display shelf'];
  const collections = ['Field finds', 'Studio ceramics', 'Paper archive'];
  const rows = Array.from({ length: 32 }, (_, index) => ({
    ID: String(index + 1).padStart(4, '0'),
    Title: `${['Glazed vessel', 'Survey token', 'Pressed specimen', 'Archive print'][index % 4]} ${index + 1}`,
    Tags: index % 3 ? 'reviewed, catalogued' : 'uncatalogued',
    Location: locations[index % 3]!,
    Condition: conditions[index % 3]!,
    Collection: collections[index % 3]!,
    Image: index === 0 ? 'https://images.example.invalid/sample-vessel.png' : ''
  }));
  return { headers: Object.keys(rows[0]!), rows };
}

function sampleMapping(): ColumnMap {
  return { id: 'ID', title: 'Title', image: 'Image', tags: 'Tags', location: 'Location', condition: 'Condition', collection: 'Collection' };
}

function rowsFromParsed(parsed: ParsedCsv, mapping: ColumnMap): CatalogRow[] {
  return parsed.rows.map((raw, sourceIndex) => ({
    key: `${sourceIndex}:${raw[mapping.id]}`,
    sourceIndex,
    raw,
    id: raw[mapping.id] ?? '',
    title: raw[mapping.title] ?? '',
    image: raw[mapping.image] ?? '',
    tags: raw[mapping.tags] ?? '',
    location: raw[mapping.location] ?? '',
    condition: raw[mapping.condition] ?? '',
    collection: raw[mapping.collection] ?? ''
  }));
}

function clearDeskData(): void {
  for (const url of state.localImages.values()) URL.revokeObjectURL(url);
  state.screen = 'import';
  state.fileName = '';
  state.parsed = null;
  state.mapping = null;
  state.rows = [];
  state.selection.clear();
  state.changes = {};
  state.batches = [];
  state.renderLimit = CATALOG_PAGE_SIZE;
  state.query = '';
  state.filters = { location: '', condition: '', collection: '', staged: '' };
  state.localImages.clear();
  state.remoteImages = false;
}

function loadDemoDesk(session: DemoSession | null = null): void {
  const parsed = session ? { headers: session.headers, rows: session.sourceRows } : sampleCatalog();
  const mapping = session?.mapping ?? sampleMapping();
  state.fileName = session?.fileName ?? 'sample-collection.csv';
  state.parsed = parsed;
  state.mapping = mapping;
  state.rows = rowsFromParsed(parsed, mapping);
  state.selection.clear();
  state.changes = session?.changes ?? {};
  state.batches = session?.batches ?? [];
  state.renderLimit = CATALOG_PAGE_SIZE;
  state.query = '';
  state.filters = { location: '', condition: '', collection: '', staged: '' };
  state.localImages.clear();
  state.remoteImages = false;
  state.screen = 'workspace';
}

function readDemoSession(): DemoSession | null {
  try { return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) ?? 'null') as DemoSession | null; } catch { return null; }
}

function persistDemoSession(): void {
  if (!state.parsed || !state.mapping) return;
  const saved: DemoSession = {
    savedAt: Date.now(),
    fileName: state.fileName,
    headers: state.parsed.headers,
    sourceRows: state.parsed.rows,
    mapping: state.mapping,
    changes: state.changes,
    batches: state.batches
  };
  try { localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(saved)); } catch { announce('The demo reset because this browser could not keep its sample state.'); }
}

function demoUrl(): string {
  const url = new URL(location.href);
  url.searchParams.delete('license');
  url.searchParams.set('demo', '1');
  return `${url.pathname}${url.search}${url.hash}`;
}

function enterDemo(pushHistory = true): void {
  state.demo = true;
  state.licenseValid = false;
  loadDemoDesk(readDemoSession());
  if (pushHistory) history.pushState({}, '', demoUrl());
  render();
  persistDemoSession();
  document.querySelector<HTMLElement>('#main')?.focus();
  announce('Sample catalog opened in the demo desk.');
}

function resetDemo(): void {
  localStorage.removeItem(DEMO_SESSION_KEY);
  state.demo = true;
  loadDemoDesk();
  history.replaceState({}, '', demoUrl());
  render();
  persistDemoSession();
  document.querySelector<HTMLElement>('#main')?.focus();
  announce('Demo reset to the 32-item sample catalog.');
}

function startForReal(): void {
  localStorage.removeItem(DEMO_SESSION_KEY);
  state.demo = false;
  clearDeskData();
  const url = new URL(location.href);
  url.searchParams.delete('demo');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  render();
  document.querySelector<HTMLElement>('#main')?.focus();
  announce('Demo data discarded. Choose your catalog CSV to start for real.');
}

function bindCommon(): void {
  document.querySelectorAll<HTMLElement>('[data-action="home"]').forEach((el) => el.addEventListener('click', (event) => { event.preventDefault(); if (state.screen === 'workspace' && Object.keys(state.changes).length && !confirm('Leave this desk? Exported files are safe, but unstored staged edits will be cleared.')) return; resetDesk(); }));
  document.querySelector<HTMLElement>('[data-action="theme"]')?.addEventListener('click', () => { state.theme = state.theme === 'light' ? 'dark' : 'light'; localStorage.setItem('cbd-theme', state.theme); document.documentElement.dataset.theme = state.theme; render(); });
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const token = (document.querySelector<HTMLInputElement>('#license-token')?.value ?? '').trim(); if (!token || state.demo) return; localStorage.setItem(LICENSE_KEY, token); await verifyLicense(token, true); });
  document.querySelector<HTMLElement>('[data-action="forget-license"]')?.addEventListener('click', () => { localStorage.removeItem(LICENSE_KEY); localStorage.removeItem(LICENSE_CACHE_KEY); state.licenseValid = false; render(); announce('License removed from this device.'); });
  document.querySelector<HTMLElement>('[data-action="reset-demo"]')?.addEventListener('click', resetDemo);
  document.querySelector<HTMLElement>('[data-action="start-real"]')?.addEventListener('click', startForReal);
}

async function loadCsvFile(file: File): Promise<void> {
  if (file.size > 15 * 1024 * 1024) { announce('That CSV is over 15 MB. Split the export into smaller fieldwork batches.'); return; }
  try {
    state.parsed = parseCsv(await file.text());
    if (!state.parsed.rows.length) throw new Error('The CSV has headings but no item rows.');
    state.fileName = file.name;
    state.mapping = null;
    state.screen = 'mapping';
    render();
    document.querySelector<HTMLElement>('#main')?.focus();
  } catch (error) { announce(error instanceof Error ? error.message : 'The CSV could not be read.'); }
}

function bindImport(): void {
  const input = document.querySelector<HTMLInputElement>('#csv-file')!;
  input.addEventListener('change', () => { const file = input.files?.[0]; if (file) void loadCsvFile(file); });
  const drop = document.querySelector<HTMLElement>('#drop-zone')!;
  for (const eventName of ['dragenter', 'dragover']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.add('dragging'); });
  for (const eventName of ['dragleave', 'drop']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.remove('dragging'); });
  drop.addEventListener('drop', (event) => { const file = event.dataTransfer?.files[0]; if (file) void loadCsvFile(file); });
  document.querySelector<HTMLElement>('[data-action="demo"]')?.addEventListener('click', () => enterDemo());
  document.querySelector<HTMLElement>('[data-action="restore-session"]')?.addEventListener('click', restoreSession);
}

function bindMapping(): void {
  document.querySelector<HTMLElement>('[data-action="back-import"]')?.addEventListener('click', () => { state.screen = 'import'; render(); });
  document.querySelector<HTMLFormElement>('#mapping-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const mapping = Object.fromEntries(['id', 'title', 'image', 'tags', 'location', 'condition', 'collection'].map((key) => [key, String(data.get(key) ?? '')])) as unknown as ColumnMap;
    if (!mapping.id) { announce('Choose the column that contains item IDs.'); return; }
    const conflict = mappingConflict(mapping);
    if (conflict) { announce(conflict); return; }
    const parsed = state.parsed!;
    const ids = parsed.rows.map((row) => row[mapping.id] ?? '');
    const blanks = unsafeIdCount(parsed.rows, mapping.id);
    const duplicates = ids.filter((id, index) => id !== '' && ids.indexOf(id) !== index);
    if (blanks) { announce(`${blanks} row${blanks === 1 ? ' has' : 's have'} a blank ID. Fill them in before safe patching.`); return; }
    if (duplicates.length) { announce(`Duplicate ID “${duplicates[0]}” would make a patch ambiguous. Make IDs unique first.`); return; }
    state.mapping = mapping;
    state.rows = rowsFromParsed(parsed, mapping);
    state.selection.clear(); state.renderLimit = CATALOG_PAGE_SIZE;
    state.screen = 'workspace'; persistSession(); render(); document.querySelector<HTMLElement>('#main')?.focus();
  });
}

function updateSelectionFromDom(): void {
  document.querySelectorAll<HTMLInputElement>('[data-select-key]').forEach((input) => { const key = input.dataset.selectKey!; if (input.checked) state.selection.add(key); else state.selection.delete(key); });
}

function resetVisibleScope(): boolean {
  const hadSelection = state.selection.size > 0;
  state.selection.clear();
  state.renderLimit = CATALOG_PAGE_SIZE;
  return hadSelection;
}

function announceScopeReset(hadSelection: boolean): void {
  if (hadSelection) announce('Selection cleared because the visible results changed.');
}

function bindWorkspace(): void {
  const narrow = matchMedia('(max-width: 760px)').matches;
  const compact = matchMedia('(max-width: 1000px)').matches;
  const filtersRail = document.querySelector<HTMLElement>('.filters');
  const ledgerRail = document.querySelector<HTMLElement>('.ledger');
  if (narrow && filtersRail) filtersRail.inert = true;
  if (compact && ledgerRail) ledgerRail.inert = true;
  document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', (event) => { state.query = (event.target as HTMLInputElement).value; const hadSelection = resetVisibleScope(); render(); requestAnimationFrame(() => { const search = document.querySelector<HTMLInputElement>('#search'); search?.focus(); search?.setSelectionRange(state.query.length, state.query.length); }); announceScopeReset(hadSelection); });
  document.querySelectorAll<HTMLSelectElement>('[data-filter]').forEach((select) => select.addEventListener('change', () => { const key = select.dataset.filter as keyof typeof state.filters; state.filters[key] = select.value; const hadSelection = resetVisibleScope(); render(); announceScopeReset(hadSelection); }));
  document.querySelectorAll<HTMLInputElement>('[data-select-key]').forEach((input) => input.addEventListener('change', () => { updateSelectionFromDom(); render(); }));
  document.querySelector<HTMLElement>('[data-action="select-visible"]')?.addEventListener('click', () => { const rows = visibleRows().slice(0, state.renderLimit); rows.forEach((row) => state.selection.add(row.key)); render(); announce(`${rows.length} visible items selected.`); });
  document.querySelector<HTMLElement>('[data-action="select-matching"]')?.addEventListener('click', () => { const rows = visibleRows(); rows.forEach((row) => state.selection.add(row.key)); render(); announce(`${rows.length} matching items selected.`); });
  document.querySelector<HTMLElement>('[data-action="load-more"]')?.addEventListener('click', () => { state.renderLimit += CATALOG_PAGE_SIZE; render(); });
  document.querySelectorAll<HTMLElement>('[data-action="clear-selection"]').forEach((button) => button.addEventListener('click', () => { state.selection.clear(); render(); }));
  document.querySelectorAll<HTMLElement>('[data-action="clear-filters"]').forEach((button) => button.addEventListener('click', () => { state.query = ''; state.filters = { location: '', condition: '', collection: '', staged: '' }; const hadSelection = resetVisibleScope(); render(); announceScopeReset(hadSelection); }));
  document.querySelector<HTMLInputElement>('#remote-images')?.addEventListener('change', (event) => { state.remoteImages = (event.target as HTMLInputElement).checked; render(); });
  const field = document.querySelector<HTMLSelectElement>('#stage-field'); const operation = document.querySelector<HTMLSelectElement>('#stage-operation');
  const syncOperations = () => { if (!field || !operation) return; [...operation.options].forEach((option) => { option.hidden = field.value !== 'tags' && ['add', 'remove'].includes(option.value); }); if (field.value !== 'tags' && ['add', 'remove'].includes(operation.value)) operation.value = 'set'; const input = document.querySelector<HTMLInputElement>('#stage-value'); if (input) input.disabled = operation.value === 'clear'; };
  field?.addEventListener('change', syncOperations); operation?.addEventListener('change', syncOperations); syncOperations();
  document.querySelector<HTMLFormElement>('#stage-form')?.addEventListener('submit', stageChanges);
  document.querySelector<HTMLElement>('[data-action="undo-batch"]')?.addEventListener('click', undoLastBatch);
  document.querySelectorAll<HTMLElement>('[data-remove-change]').forEach((button) => button.addEventListener('click', () => { delete state.changes[button.dataset.removeChange!]; render(); persistSession(); announce('Staged changes removed for that item.'); }));
  document.querySelector<HTMLElement>('[data-action="export-patch"]')?.addEventListener('click', () => exportChanges(false));
  document.querySelector<HTMLElement>('[data-action="export-undo"]')?.addEventListener('click', () => exportChanges(true));
  document.querySelector<HTMLElement>('[data-action="new-catalog"]')?.addEventListener('click', () => { if (!Object.keys(state.changes).length || confirm('Clear this local desk and choose another catalog? Export first if you need these staged changes.')) resetDesk(); });
  document.querySelector<HTMLInputElement>('#image-files')?.addEventListener('change', (event) => attachImages((event.target as HTMLInputElement).files));
  document.querySelector<HTMLElement>('[data-action="open-filters"]')?.addEventListener('click', () => { if (filtersRail) { filtersRail.inert = false; filtersRail.classList.add('mobile-open'); document.querySelector<HTMLInputElement>('#search')?.focus(); } });
  document.querySelector<HTMLElement>('[data-action="close-filters"]')?.addEventListener('click', () => { if (filtersRail) { filtersRail.classList.remove('mobile-open'); filtersRail.inert = true; document.querySelector<HTMLElement>('[data-action="open-filters"]')?.focus(); } });
  document.querySelector<HTMLElement>('[data-action="open-ledger"]')?.addEventListener('click', () => { if (ledgerRail) { ledgerRail.inert = false; ledgerRail.classList.add('mobile-open'); document.querySelector<HTMLSelectElement>('#stage-field')?.focus(); } });
  document.querySelector<HTMLElement>('[data-action="close-ledger"]')?.addEventListener('click', () => { if (ledgerRail) { ledgerRail.classList.remove('mobile-open'); ledgerRail.inert = true; document.querySelector<HTMLElement>('[data-action="open-ledger"]')?.focus(); } });
  document.onkeydown = (event) => { if (event.key !== 'Escape') return; if (filtersRail?.classList.contains('mobile-open')) document.querySelector<HTMLElement>('[data-action="close-filters"]')?.click(); if (ledgerRail?.classList.contains('mobile-open')) document.querySelector<HTMLElement>('[data-action="close-ledger"]')?.click(); };
}

function splitTags(value: string): string[] { return value.split(/[;,]/).map((tag) => tag.trim()).filter(Boolean); }

function stageChanges(event: SubmitEvent): void {
  event.preventDefault();
  const form = new FormData(event.currentTarget as HTMLFormElement); const field = String(form.get('field')) as EditableField; const operation = String(form.get('operation')); const value = String(form.get('value') ?? '').trim();
  if (!state.selection.size) { announce('Select at least one item first.'); return; }
  if (operation !== 'clear' && !value) { announce('Enter a value to stage, or choose “Clear value”.'); return; }
  const selectedRows = visibleRows().filter((row) => state.selection.has(row.key));
  if (selectedRows.length !== state.selection.size) state.selection = new Set(selectedRows.map((row) => row.key));
  if (!selectedRows.length) { render(); announce('Selection cleared because those items are no longer visible.'); return; }
  const previous: ChangeBatch['previous'] = [];
  for (const row of selectedRows) {
    const key = row.key;
    const before = row[field]; const current = currentValue(row, field); let after = value;
    if (field === 'tags' && operation === 'add') after = [...new Set([...splitTags(current), ...splitTags(value)])].join(', ');
    if (field === 'tags' && operation === 'remove') { const removes = new Set(splitTags(value).map((tag) => tag.toLocaleLowerCase())); after = splitTags(current).filter((tag) => !removes.has(tag.toLocaleLowerCase())).join(', '); }
    if (operation === 'clear') after = '';
    previous.push({ key, change: state.changes[key]?.[field] ? { ...state.changes[key]![field]! } : undefined });
    state.changes[key] ??= {};
    if (after === before) { delete state.changes[key]![field]; if (!Object.keys(state.changes[key]!).length) delete state.changes[key]; }
    else state.changes[key]![field] = { before, after };
  }
  state.batches.push({ id: crypto.randomUUID(), keys: selectedRows.map((row) => row.key), field, previous, label: `${field} on ${selectedRows.length} item${selectedRows.length === 1 ? '' : 's'}` });
  state.selection.clear(); render(); persistSession(); announce(`Staged ${field} change. Source rows remain untouched.`);
}

function undoLastBatch(): void {
  const batch = state.batches.pop(); if (!batch) return;
  for (const entry of batch.previous) { if (entry.change) { state.changes[entry.key] ??= {}; state.changes[entry.key]![batch.field] = entry.change; } else if (state.changes[entry.key]) { delete state.changes[entry.key]![batch.field]; if (!Object.keys(state.changes[entry.key]!).length) delete state.changes[entry.key]; } }
  render(); persistSession(); announce(`Undid ${batch.label}.`);
}

function exportChanges(undo: boolean): void {
  try {
    const output = buildChangeExport(state.mapping!, state.rows, state.changes, undo);
    const stem = state.fileName.replace(/\.csv$/i, '') || 'collection'; const suffix = undo ? 'undo' : 'patch'; download(`${stem}-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(output.headers, output.rows), 'text/csv;charset=utf-8');
    announce(`${undo ? 'Undo manifest' : 'Patch'} exported with ${output.rows.length} row${output.rows.length === 1 ? '' : 's'}.`);
  } catch (error) {
    announce(error instanceof Error ? error.message : 'The export could not be created safely.');
  }
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function attachImages(files: FileList | null): void {
  if (!files?.length) return;
  let count = 0;
  for (const file of files) { if (!file.type.startsWith('image/')) continue; const url = URL.createObjectURL(file); state.localImages.set(file.name, url); count += 1; }
  render(); announce(`${count} local thumbnail${count === 1 ? '' : 's'} attached by filename.`);
}

function resetDesk(): void {
  if (state.demo) { resetDemo(); return; }
  localStorage.removeItem(SESSION_KEY);
  clearDeskData();
  render();
}

function persistSession(): void {
  if (state.demo) { persistDemoSession(); return; }
  if (!state.licenseValid || !state.parsed || !state.mapping) return;
  try { const saved: SavedSession = { savedAt: Date.now(), fileName: state.fileName, headers: state.parsed.headers, sourceRows: state.parsed.rows, mapping: state.mapping, changes: state.changes }; localStorage.setItem(SESSION_KEY, JSON.stringify(saved)); }
  catch { announce('This catalog is too large for local session restore. Exports still work normally.'); }
}

function readSavedSession(): SavedSession | null {
  if (state.demo) return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as SavedSession | null; } catch { return null; }
}

function restoreSession(): void {
  const saved = readSavedSession(); if (!saved) return;
  state.fileName = saved.fileName; state.parsed = { headers: saved.headers, rows: saved.sourceRows }; state.mapping = saved.mapping; state.changes = saved.changes;
  state.rows = rowsFromParsed(state.parsed, saved.mapping); state.screen = 'workspace'; render(); announce('Local desk restored. Reattach thumbnail files if needed.');
}

async function verifyLicense(token: string, force = false): Promise<void> {
  const cached = (() => { try { return JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY) ?? 'null') as LicenseVerdict | null; } catch { return null; } })();
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) { state.licenseValid = cached.valid; render(); return; }
  if (!navigator.onLine) { state.licenseValid = cached?.valid ?? false; return; }
  state.licenseChecking = true;
  try {
    const response = await fetch(`${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const verdict = await response.json() as { valid: boolean; reason?: string };
    state.licenseValid = verdict.valid; localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ valid: verdict.valid, reason: verdict.reason, checkedAt: Date.now() } satisfies LicenseVerdict)); render(); announce(verdict.valid ? 'Desk Plus unlocked on this device.' : 'That license is not active. Check the token or buy a new license.');
  } catch { state.licenseValid = cached?.valid ?? false; render(); announce('Could not reach license verification. The free desk still works.'); }
  finally { state.licenseChecking = false; }
}

function initializeLicense(): void {
  if (state.demo) return;
  const url = new URL(location.href); const received = url.searchParams.get('license');
  if (received) { localStorage.setItem(LICENSE_KEY, received); url.searchParams.delete('license'); history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`); }
  const token = received || localStorage.getItem(LICENSE_KEY); if (token) void verifyLicense(token, Boolean(received));
}

window.addEventListener('online', () => { state.online = true; render(); announce('Back online. Local work was not interrupted.'); });
window.addEventListener('offline', () => { state.online = false; render(); announce('You are offline. This desk and your local files still work.'); });
window.addEventListener('popstate', () => {
  const url = new URL(location.href);
  const wantsDemo = url.searchParams.get('demo') === '1' || url.pathname === '/demo';
  if (wantsDemo && !state.demo) enterDemo(false);
  if (!wantsDemo && state.demo) startForReal();
});

if (state.demo) { loadDemoDesk(readDemoSession()); persistDemoSession(); }
render();
initializeLicense();
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
