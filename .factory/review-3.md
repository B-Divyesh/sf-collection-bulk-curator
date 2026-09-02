# Adversarial first-read review 3 — Collection Batch Desk

**Review date:** 2026-09-02 UTC  
**Reviewed URL:** <https://collection-bulk-curator.sociobot.in/>  
**Reviewed commit:** `9c23bd569cec6f02fd6cc6c8b3d311ea2f36ea8b`  
**Verdict:** **PASS**

No blocking or minor finding remains. This review was run from scratch against
the live site and a clean local clone; it is not a diff-only confirmation.

## Cold first impression

At 390 × 844 before scrolling, the product is understandable: it lets
collectors choose catalog items, stage a bulk change, and export patch and undo
CSV files without altering the source catalog. It is for collectors updating a
chosen subset of physical items. The first action is **Try it with sample
data**, and the adjacent copy says it opens 32 items in the review desk.

The same answer was available at 1440 × 1000. The phone action occupied y=326
to y=373 of the opening 844 px viewport. The cold phone and desktop visits had
no page errors, console errors, cookies, or third-party requests. The opening
view names the job, audience, result-naming action, and three plain facts.

## Copy audit

Counts treat hyphenated terms, `$19`, URLs, and code literals as one word.
Visible labels and fragments are included as well as complete sentences, since
they are still copy a visitor encounters. No entry exceeds 22 words; no jargon,
unsupported marketing adjective, inconsistent product term, information-free
heading, or non-result-naming action was found.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to workspace | 3 | Pass |
| Collection Batch Desk | 3 | Pass |
| Review catalog changes before export | 5 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Desk Plus | 2 | Pass |
| 01 Start | 2 | Pass |
| Stage bulk catalog edits before export | 6 | Pass |
| For collectors updating a chosen subset without losing the original catalog. | 10 | Pass |
| Try it with sample data | 5 | Pass; names the result |
| Loads 32 sample items in the review desk. | 9 | Pass; `sample-catalog` |
| Catalog stays in your browser | 5 | Pass; `local-data` |
| Works offline after first visit | 5 | Pass; `offline-reload` |
| $19 once for Desk Plus | 5 | Pass; `desk-plus-price` |
| Illustration of a local catalog review desk. | 7 | Pass |
| 02 Import | 2 | Pass |
| Choose your catalog CSV | 4 | Pass |
| Map columns, stage changes, then export a patch CSV and undo CSV. | 12 | Pass; export claims |
| Drop CSV here or browse | 6 | Pass; names file result |
| UTF-8 CSV · first row must be headings | 7 | Pass |
| Optional thumbnails | 2 | Pass |
| Select image files after the CSV. | 6 | Pass |
| They are matched by filename and stay local. | 8 | Pass; `local-thumbnail-matching` |
| Review, stage, and export | 4 | Pass |
| Filter items | 2 | Pass |
| Search titles and IDs. | 4 | Pass |
| Then filter collection, location, or condition. | 7 | Pass |
| Stage field changes | 3 | Pass |
| Select visible items. | 3 | Pass |
| Stage one field at a time. | 6 | Pass |
| Source rows stay unchanged. | 4 | Pass; `source-rows-unchanged` |
| Export both files | 3 | Pass |
| Export a patch CSV and an undo CSV with the original values. | 13 | Pass; export claims |
| Your catalog stays in this browser. | 6 | Pass; `local-data` |
| Generated catalog review illustration. | 4 | Pass |
| One-time license | 2 | Pass |
| Desk Plus · $19 | 3 | Pass |
| Automatically save and restore your local workspace next visit. | 9 | Pass; `desk-plus-session` |
| Core review, undo, and both exports stay free. | 8 | Pass; `free-core-workflow` |
| Buy once | 2 | Pass; names purchase result |
| Have a license? | 3 | Pass |
| Paste license token | 3 | Pass |
| Verify | 1 | Pass; scoped by the labelled license field |
| Sociobot and Dodo handle payment. | 6 | Pass; disclosure |
| Refunds are handled by the merchant of record. | 8 | Pass; disclosure |
| Source on GitHub (external) | 4 | Pass |
| Built by Param Factory · v1.0.2 | 6 | Pass |

### README

| Sentence | Words | Check |
| --- | ---: | --- |
| Stage bulk catalog edits before export. | 6 | Pass |
| For collectors with many physical items, import a CSV, review a filtered subset, then export a patch and an undo CSV. | 20 | Pass |
| The desk maps CSV headings, optionally matches local thumbnails by filename, filters visible records, and stages export-only changes. | 18 | Pass |
| It exports a patch CSV and a separate undo CSV with original values. | 13 | Pass; export claims |
| Blank and duplicate IDs are blocked. | 6 | Pass; `id-validation` |
| IDs such as `0007` remain strings throughout. | 7 | Pass; `exact-ids` |
| Catalog data stays in the browser by default. | 8 | Pass; `local-data` |
| Remote thumbnails stay off until explicitly enabled. | 7 | Pass; `remote-thumbnails` |
| Core import, filtering, staging, undo, and export are free. | 9 | Pass; `free-core-workflow` |
| Desk Plus is a $19 one-time license for automatic local workspace restore. | 12 | Pass; price and session claims |
| Open `/?demo=1` or select Try it with sample data on the first screen. | 12 | Pass |
| It opens a 32-item catalog directly in the review desk. | 9 | Pass; `sample-catalog` |
| Demo state uses the `demo:collection-bulk-curator:session` browser-storage namespace and never reads or overwrites a real Desk Plus session. | 16 | Pass; `demo-isolation` |
| Use Reset demo to start the sample again or Start for real to discard it and import a CSV. | 18 | Pass |
| Requires Node.js 20 or newer. | 5 | Pass |
| Open the local URL printed by Vite. | 7 | Pass |
| Use Try it with sample data for a complete no-file walkthrough, or open `/?demo=1` directly. | 15 | Pass |
| Playwright `1.58.2` is pinned. | 4 | Pass |
| The factory image includes its Chromium binary at `$PLAYWRIGHT_BROWSERS_PATH`; elsewhere run `npx playwright install chromium` once. | 16 | Pass |
| Claim checks are listed in `.factory/claims.json`. | 6 | Pass |
| Each command can be run by appending its grep tag, for example `npm test -- --grep @claim:patch-csv`. | 16 | Pass |
| The exact deploy command is `npm run build`. | 8 | Pass |
| It produces `dist/index.html`, `/privacy/`, `/terms/`, and a product-styled `404.html`. | 9 | Pass |
| Deploy the contents of `dist/` to Azure Static Web Apps. | 10 | Pass |
| `public/staticwebapp.config.json` supplies security, cache, and 404 response settings. | 7 | Pass |
| CSV parsing supports UTF-8 BOMs, quoted commas, escaped quotes, and multiline fields. | 11 | Pass; `csv-format-support` |
| Map your ID and optional title, thumbnail, tags, location, condition, and collection headings before opening the desk. | 17 | Pass; `csv-heading-mapping` |
| Thumbnails may be attached as local image files and are matched against the mapped filename on desktop or mobile. | 18 | Pass; `local-thumbnail-matching` |
| Patch and undo exports contain the mapped ID heading and every changed field. | 12 | Pass; export claims |
| The app has no analytics, ads, remote fonts, or third-party scripts. | 10 | Pass; `no-tracking` |
| The app stores your theme choice. | 6 | Pass |
| It can store an optional license token and verification result. | 10 | Pass; license claims |
| Desk Plus can save a workspace. | 6 | Pass; `desk-plus-session` |
| Demo data is separate and can be reset. | 8 | Pass; `demo-isolation` |
| Checkout and license verification use the Sociobot billing API. | 9 | Pass; implementation disclosure |
| A staging build can set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1`. | 7 | Pass |
| The source is MIT licensed. | 5 | Pass |
| The generated illustration provenance and full visual specification are in `.factory/design.md`. | 10 | Pass |

The landing and README claims map to all 20 IDs in `.factory/claims.json`.
No additional capability, privacy, price, or performance promise was found.

## Demo, privacy, and claims

- `/?demo=1` directly opened the populated review desk with 32 realistic
  sample catalog items. The first post-click view is already the working
  product, not a tutorial or empty state.
- The persistent banner reads **Demo — sample data, nothing is saved** and
  exposes **Reset demo** and **Start for real**. The clean browser context
  contained only `demo:collection-bulk-curator:session`; it had no cookies.
- The declared demo-isolation test seeds a real-session sentinel and confirms
  demo entry, reset, and exit leave it unchanged. Reset restores 32 items.
- Cold landing and demo request logs contained only product-origin document,
  script, stylesheet, and illustration requests. The remote-thumbnail claim
  test verifies no remote image request happens before the explicit opt-in.
- From a clean clone at `/tmp/collection-review-3.dhoU39`, `npm ci` succeeded.
  Each exact test command listed by all 20 `claims.json` entries passed; the
  final Playwright result was `{"status":"passed","failedTests":[]}`.
  The complete `npm test` run also passed: 7 Vitest and 48 Playwright tests.
- `npm run build` passed and emitted `dist/`. Its initial application JavaScript
  is 12.85 kB gzip; CSS is 5.53 kB gzip.

## Earlier findings and history

I read every earlier review, polish record, and the handoff. Each prior finding
was confirmed fixed in both live behaviour and current code:

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | `#page-title` is focusable and each route/screen render requests its focus; the browser regression covers demo, reset, Back/Forward, map, and desk transitions. |
| F-1-2 | Live subtitle and license label use literal task copy; obsolete fieldwork phrases and coordinate label are absent. CSV recovery says “Split the CSV into smaller files.” |
| F-1-3 | The README storage material is split into four short sentences. |
| F-2-1 | The live h1, title, and README say “before export,” without the unbounded “safely” promise. |
| F-2-2 | The unsupported “Secure checkout” sentence is absent; payment wording only identifies the parties. |
| F-2-3 | The product consistently says “undo CSV,” including export controls and toast regression coverage. |
| F-2-4 | Footer source links visibly say “Source on GitHub (external)” on app, legal, and 404 pages. |

No earlier finding is repeated as unresolved, half-fixed, or regressed.

## Structure, accessibility, and product fit

- `/`, `/?demo=1`, `/privacy/`, and `/terms/` returned 200. An unknown route
  returned the designed 404 with its own `Page not found — Collection Batch
  Desk` title, one h1, and home/demo recovery links. The public source link
  also returned 200.
- Every inspected route has `lang="en"`, one h1, a plain description,
  canonical URL, OG/Twitter image metadata, SVG favicon, apple touch icon,
  consistent header/footer, skip link, and appropriate route title. The
  sitemap and robots file cover the public routes; the static configuration
  supplies the response-header CSP and the 404 rewrite.
- The clean-suite Axe integration covers import, workspace, both 390 px paths,
  Privacy, and Terms with no serious or critical violations. The focus
  regression verifies the current h1 after navigation. Keyboard-labelled
  controls and visible focus are included in the same suite.
- The warm-paper map desk, contour rules, geometric image crop, pine/vermillion
  palette, serif/system type pairing, and compact survey workspace are visibly
  specific to reviewed batch edits. They do not resemble a generic SaaS hero or
  feature-card grid, and match `.factory/design.md`.
- The brief already implies and supplies the useful leverage: arbitrary CSV
  import and mapping, thumbnail matching, filtering, staged batch changes, and
  paired patch/undo export. AI or sync would not improve this local-first job
  by default, so no omitted AI feature or decorative AI control is expected.

## What would make this perfect

Continue to preserve the one-click isolated demo, paired exports, and literal
copy as future changes are made. No current product change is required.
