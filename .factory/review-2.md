# Adversarial first-read review 2 — Collection Batch Desk

**Review date:** 2026-09-01 UTC  
**Reviewed URL:** <https://collection-bulk-curator.sociobot.in>  
**Commit reviewed:** `7f4dab3305e3f129de07314b5b88ac1106ac8103`  
**Verdict:** **FAIL**

The core job is clear and the demo is genuinely usable, but the required bar is
zero findings. Four copy/structure findings remain below.

## Cold first impression

At 390 × 844 before scrolling, this reads as a tool for collectors who need to
apply a bulk edit to selected catalog items, while retaining the original
catalog and exporting a patch plus undo file. I would click **Try it with
sample data** first because the adjacent text says it loads 32 items in the
review desk. The same answer was available on a fresh desktop 1440 × 1000
visit. This is not a blocking first-screen finding.

The phone action was wholly in the opening viewport (y=326, height=47). The
desktop and phone both loaded with no page errors and only same-origin product
requests.

## Findings

### F-2-1 — Minor — the headline makes an unlisted safety promise

**Location:** landing h1, title, and README opening: **“Stage bulk catalog
edits safely.”**

**Why this is a finding:** “safely” is a claim a first-time visitor can rely
on, but it has no corresponding entry in `.factory/claims.json`. The existing
tests demonstrate several safeguards, but do not define or prove the broad
promise of safety. This also leaves the main task less precise than it can be.

**Concrete fix:** use **“Stage bulk catalog edits before export”** for the h1,
title, and README opening. Alternatively define “safely” with a bounded,
testable claim and add one `@claim:` test for that exact promise.

### F-2-2 — Minor — checkout is described as “secure” without a claim or proof

**Location:** Desk Plus disclosure: **“Secure checkout by Sociobot / Dodo.”**

**Why this is a finding:** “Secure” is an unlisted security claim and a banned
marketing adjective under the plain-words rules. The claimed checkout-route
test verifies where the button goes, not the security of that payment flow.

**Concrete fix:** remove this sentence. The visible **Buy once** action and the
Terms page can state the payment parties without making a security promise.

### F-2-3 — Minor — one exported file has two names

**Location:** the landing, buttons, README, Terms, and copy-audit terminology
table call the file an **“undo CSV”**; `src/main.ts:300` calls it an **“undo
manifest”** in the demo metadata and `src/main.ts:602` announces **“Undo
manifest exported …”**.

**Why this is a finding:** a collector looking for the downloaded file sees
different names for the same result. The product’s own terminology table says
the one term is “undo CSV”, so the live message regresses that decision.

**Concrete fix:** replace the two visitor-facing “undo manifest” instances
with **“undo CSV”** and add a browser assertion that the export announcement
uses the same name as the export button.

### F-2-4 — Minor — the external source link is not identified as external

**Location:** footer link **“Source”** points to
`https://github.com/B-Divyesh/sf-collection-bulk-curator`.

**Why this is a finding:** the site-structure requirement says external links
say so. A visitor cannot tell that this leaves the product before activating
the link.

**Concrete fix:** label it **“Source on GitHub (external)”** (or add an
equivalent visible external-link icon and accessible name), then add a
Playwright assertion for the label and GitHub href.

## Copy audit

Counts use the repository convention: hyphenated forms, `$19`, URLs, and code
literals count as one word. The audit includes visible labels, headings,
actions, and the closed Desk Plus disclosure because they are visitor-facing
when opened. `F-2-1` through `F-2-4` are the only flags; no entry exceeds 22
words.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to workspace | 3 | Pass. |
| Collection Batch Desk | 3 | Pass. |
| Review catalog changes before export | 5 | Pass. |
| Demo | 1 | Pass. |
| How it works | 3 | Pass. |
| Privacy | 1 | Pass. |
| Terms | 1 | Pass. |
| Desk Plus | 2 | Pass. |
| 01 Start | 2 | Pass. |
| Stage bulk catalog edits safely | 5 | **Flag F-2-1.** |
| For collectors updating a chosen subset without losing the original catalog. | 10 | Pass. |
| Try it with sample data | 5 | Pass; result-naming demo action. |
| Loads 32 sample items in the review desk. | 9 | Pass; `sample-catalog`. |
| Catalog stays in your browser | 5 | Pass; `local-data`. |
| Works offline after first visit | 5 | Pass; `offline-reload`. |
| $19 once for Desk Plus | 5 | Pass; `desk-plus-price`. |
| Illustration of a local catalog review desk. | 7 | Pass. |
| 02 Import | 2 | Pass. |
| Choose your catalog CSV | 4 | Pass. |
| Map columns, stage changes, then export a patch CSV and undo CSV. | 12 | Pass; declared export claims. |
| Drop CSV here or browse | 6 | Pass. |
| UTF-8 CSV · first row must be headings | 7 | Pass. |
| Optional thumbnails | 2 | Pass. |
| Select image files after the CSV. | 6 | Pass. |
| They are matched by filename and stay local. | 8 | Pass; `local-thumbnail-matching` / `local-data`. |
| How it works | 3 | Pass. |
| Review, stage, and export | 4 | Pass. |
| Filter items | 2 | Pass. |
| Search titles and IDs. | 4 | Pass. |
| Then filter collection, location, or condition. | 7 | Pass. |
| Stage field changes | 3 | Pass. |
| Select visible items. | 3 | Pass. |
| Stage one field at a time. | 6 | Pass. |
| Source rows stay unchanged. | 4 | Pass; `source-rows-unchanged`. |
| Export both files | 3 | Pass. |
| Export a patch CSV and an undo CSV with the original values. | 13 | Pass; declared export claims. |
| Your catalog stays in this browser. | 6 | Pass; `local-data`. |
| Generated catalog review illustration. | 4 | Pass; provenance label. |
| Source | 1 | **Flag F-2-4.** |
| Built by Param Factory · v1.0.2 | 6 | Pass. |
| One-time license | 2 | Pass. |
| Desk Plus · $19 | 3 | Pass. |
| Automatically save and restore your local workspace next visit. | 9 | Pass; `desk-plus-session`. |
| Core review, undo, and both exports stay free. | 8 | Pass; `free-core-workflow`. |
| Buy once | 2 | Pass; result-naming action. |
| Have a license? | 3 | Pass. |
| Paste license token | 3 | Pass. |
| Verify | 1 | Pass in its labeled license form. |
| Secure checkout by Sociobot / Dodo. | 5 | **Flag F-2-2.** |
| Refunds are handled by the merchant of record. | 8 | Pass; legal disclosure. |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Collection Batch Desk | 3 | Pass. |
| Stage bulk catalog edits safely for collectors with many physical items. | 11 | **Flag F-2-1.** |
| Import a CSV, review a filtered subset, then export a patch and an undo CSV. | 15 | Pass. |
| The desk maps CSV headings, optionally matches local thumbnails by filename, filters visible records, and stages export-only changes. | 18 | Pass. |
| It exports a patch CSV and a separate undo CSV with original values. | 13 | Pass. |
| Blank and duplicate IDs are blocked. | 6 | Pass; `id-validation`. |
| IDs such as `0007` remain strings throughout. | 7 | Pass; `exact-ids`. |
| Product boundaries | 2 | Pass. |
| Catalog data stays in the browser by default. | 8 | Pass; `local-data`. |
| Remote thumbnails stay off until explicitly enabled. | 7 | Pass; `remote-thumbnails`. |
| Core import, filtering, staging, undo, and export are free. | 9 | Pass; `free-core-workflow`. |
| Desk Plus is a $19 one-time license for automatic local workspace restore. | 12 | Pass; price/session claims. |
| Try the demo | 3 | Pass. |
| Open `/?demo=1` or select Try it with sample data on the first screen. | 12 | Pass. |
| It opens a 32-item catalog directly in the review desk. | 9 | Pass; `sample-catalog`. |
| Demo state uses the `demo:collection-bulk-curator:session` browser-storage namespace and never reads or overwrites a real Desk Plus session. | 16 | Pass; `demo-isolation`. |
| Use Reset demo to start the sample again or Start for real to discard it and import a CSV. | 18 | Pass. |
| Run locally | 2 | Pass. |
| Requires Node.js 20 or newer. | 5 | Pass. |
| npm install | 2 | Pass; command. |
| npm run dev | 3 | Pass; command. |
| Open the local URL printed by Vite. | 7 | Pass. |
| Use Try it with sample data for a complete no-file walkthrough, or open `/?demo=1` directly. | 15 | Pass. |
| Test and build | 3 | Pass. |
| Playwright `1.58.2` is pinned. | 4 | Pass. |
| The factory image includes its Chromium binary at `$PLAYWRIGHT_BROWSERS_PATH`; elsewhere run `npx playwright install chromium` once. | 16 | Pass. |
| npm test | 2 | Pass; command. |
| npm run build | 3 | Pass; command. |
| Claim checks are listed in `.factory/claims.json`. | 6 | Pass. |
| Each command can be run by appending its grep tag, for example `npm test -- --grep @claim:patch-csv`. | 16 | Pass. |
| The exact deploy command is `npm run build`. | 8 | Pass. |
| It produces `dist/index.html`, `/privacy/`, `/terms/`, and a product-styled `404.html`. | 9 | Pass. |
| Deploy the contents of `dist/` to Azure Static Web Apps. | 10 | Pass. |
| `public/staticwebapp.config.json` supplies security, cache, and 404 response settings. | 7 | Pass. |
| CSV behavior | 2 | Pass. |
| CSV parsing supports UTF-8 BOMs, quoted commas, escaped quotes, and multiline fields. | 11 | Pass; `csv-format-support`. |
| Map your ID and optional title, thumbnail, tags, location, condition, and collection headings before opening the desk. | 17 | Pass. |
| Thumbnails may be attached as local image files and are matched against the mapped filename on desktop or mobile. | 18 | Pass; `local-thumbnail-matching`. |
| Patch and undo exports contain the mapped ID heading and every changed field. | 12 | Pass; export claims. |
| Privacy and licensing | 3 | Pass. |
| The app has no analytics, ads, remote fonts, or third-party scripts. | 10 | Pass; `no-tracking`. |
| The app stores your theme choice. | 6 | Pass. |
| It can store an optional license token and verification result. | 10 | Pass; license claims. |
| Desk Plus can save a workspace. | 6 | Pass; `desk-plus-session`. |
| Demo data is separate and can be reset. | 8 | Pass; `demo-isolation`. |
| Checkout and license verification use the Sociobot billing API. | 9 | Pass; implementation disclosure, covered by checkout/license route tests. |
| A staging build can set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1`. | 7 | Pass; setup instruction. |
| The source is MIT licensed. | 5 | Pass; `LICENSE` checked. |
| The generated illustration provenance and full visual specification are in `.factory/design.md`. | 10 | Pass; repository pointer. |

The terminology table itself names the original-values output **“undo CSV.”**
The live metadata and export toast conflict with it; that is **F-2-3**.

## Demo, sandbox, privacy, and claims

- In independent fresh 390 px and desktop contexts, one click opened a
  populated 32-card desk. Its initial view was already the working catalog,
  not an instruction screen.
- The persistent banner said **“Demo — sample data, nothing is saved”** and
  included **Reset demo** and **Start for real**. Reset restored all 32 cards.
  Leaving demo removed the `demo:collection-bulk-curator:session` key.
- The live request log during landing and demo use contained only
  `https://collection-bulk-curator.sociobot.in`; no cookies or console errors
  occurred on those routes. The sample remote image remained off until
  explicit opt-in in the declared claim test.
- From a new clone at this commit, `npm ci`, `npm test` (7 unit + 48 browser
  tests), all 20 exact commands listed in `.factory/claims.json`, and
  `npm run build` passed. Playwright's final run record reports
  `{ "status": "passed", "failedTests": [] }`.
- The build produces `dist/`; initial JavaScript is 12.83 kB gzip and CSS is
  5.52 kB gzip. The clean build's JavaScript and CSS SHA-256 values matched
  the live deployed assets byte-for-byte.

## History check

Every earlier finding was verified on both code and live behavior:

| Earlier finding | Result |
| --- | --- |
| F-1-1, focus current h1 after a route/screen change | Fixed. Enter demo, Back, Forward, Reset demo, and Start for real each focused `#page-title` in the live browser. |
| F-1-2, fieldwork metaphors / decorative coordinate / size-recovery text | Fixed. The live header reads “Review catalog changes before export”; the license label is “One-time license”; the coordinate label is absent; size recovery reads “Split the CSV into smaller files.” |
| F-1-3, 23-word README storage sentence | Fixed. It is now four sentences of 6, 10, 6, and 8 words. |

No earlier finding is repeated as unresolved. This review was rerun from
scratch rather than treated as a diff-only check.

## Structure, accessibility, and scope checks

- `/?demo=1`, `/privacy/`, and `/terms/` returned 200 with correct titles and
  one h1. A nonexistent route returned the designed 404 and a 404 status.
- Landing, demo, Privacy, Terms, and 404 all have `lang`, descriptions,
  canonical/OG/Twitter metadata, favicon/apple icon, title patterns, headers,
  footer links, and one main landmark/h1. Browser Back/Forward restored title,
  URL, screen, and h1 focus.
- Live Axe scans at 390 px found no serious or critical violations on landing,
  demo, Privacy, Terms, or the 404. The expected browser network diagnostic
  for the deliberate 404 status was the only console event on the 404 route;
  product routes had none.
- All site links resolved: same-origin routes returned 200 (or the designed
  404), checkout reached its hosted payment page, and the GitHub source route
  returned 200. F-2-4 remains because the source link does not say it is
  external.
- The topographic field-desk illustration, paper palette, contour lines, and
  compact review desk are distinct and match `.factory/design.md`; this is not
  a generic SaaS template. No omitted AI step is implied by the brief: CSV
  import, thumbnail matching, filtering, patch export, and undo export cover
  the stated job. Adding AI would be decorative.

## What would make this perfect

Remove the unsupported “safely” and “secure” promises, use **undo CSV**
everywhere, identify the GitHub link as external, add the two focused browser
regressions, then rerun the complete claim, live route, mobile, privacy, and
copy checks. That would leave no current finding.
