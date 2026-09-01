# Adversarial first-read review 1 — Collection Batch Desk

**Review date:** 2026-09-01  
**Reviewed URL:** <https://collection-bulk-curator.sociobot.in>  
**Base reviewed:** `67bf4474f9fec0bd97c4ba22b9f920ce3581c840`  
**Verdict:** **FAIL**

The core workflow, demo, all declared claim checks, and basic live-site checks
work. This is nevertheless a FAIL: the required standard is zero findings, and
the focus behavior and copy audit below still have findings.

## Cold first impression

At 390 × 844 before scrolling, the product is understandable. In my words: it
lets a collector select part of a catalog, propose bulk field changes, then
download patch and undo CSV files. It is for collectors editing many physical
items. I would click **Try it with sample data** first; the adjacent text says
it loads 32 items in the review desk. The same answer was available at desktop
1440 × 1000. This is not a blocking first-screen finding.

The mobile opening screen showed the h1, audience sentence, primary action,
three facts, and the original illustration without scrolling. There were no
console errors or third-party requests during that cold visit.

## Findings

### F-1-1 — Minor — route changes focus `<main>`, not the new heading

**Location:** live landing → **Try it with sample data**; `src/main.ts`,
`enterDemo`, `resetDemo`, `startForReal`, and other screen transitions.

**Evidence:** after activating **Try it with sample data** in a fresh live
browser context, the document had `activeElement.id === "main"` and
`h1Focused === false`. The same code explicitly calls
`document.querySelector('#main')?.focus()` after rendering.

**Why this matters:** a screen-reader user is not moved to the new page title
when the app changes from the landing page to the review desk. The route-change
requirement is to move focus to the new h1 and announce it; focusing the broad
main region is not that behavior.

**Concrete fix:** give each route h1 `tabindex="-1"` and, after every route or
screen change, focus `#page-title` (then keep the existing polite announcement).
Add a Playwright regression that enters demo, goes back and forward, and asserts
the active element is the current h1.

### F-1-2 — Minor — landing copy contains unexplained fieldwork metaphors

**Location:** header subtitle **“Reversible catalog fieldwork”**; Desk Plus
panel eyebrow **“One-time field kit”**; decorative hero label
**“N 38° / DESK 01”** in `src/styles.css`; import-size error says
**“smaller fieldwork batches.”**

**Why this matters:** “fieldwork”, “field kit”, and a fake coordinate label do
not name a product section or action. A first-time collector has to infer the
meaning from surrounding copy. They violate the plain-words requirement against
metaphor, mood headings, and decorative labels that carry no information.

**Concrete fix:** change the subtitle to **“Review catalog changes before
export”**, the panel eyebrow to **“One-time license”**, remove the coordinate
label, and change the error recovery to **“Split the CSV into smaller files.”**
Update `.factory/copy-audit.md` to include header, panel, footer, and recovery
copy, not only the selected hero and workflow sentences.

### F-1-3 — Minor — README has a sentence over the 22-word limit

**Location:** `README.md`, Privacy and licensing:

> “It uses browser storage for the theme, optional license token and
> verification cache, a Desk Plus workspace, and a separate resettable demo
> workspace.”

This is 23 words (the audit convention counts hyphenated compounds as one).

**Why this matters:** it bundles four storage topics into one sentence where a
privacy-conscious visitor needs to understand each one quickly.

**Concrete fix:** replace it with: **“The app stores your theme choice. It can
store an optional license token and verification result. Desk Plus can save a
workspace. Demo data is separate and can be reset.”**

## Copy audit

Counts use the repository’s convention: hyphenated compounds and `$19` count
as one word. Labels and headings are included when they are visitor-facing; a
fragment is marked as such. No landing body sentence exceeds 22 words. The
three flags above are still findings because the rule also covers jargon and
information-free headings.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Reversible catalog fieldwork | 3 | **Flag F-1-2:** mood/jargon subtitle. |
| One-time field kit | 3 | **Flag F-1-2:** mood heading. |
| Automatically save and restore your local workspace next visit. | 9 | Pass; Desk Plus session claim. |
| Core review, undo, and both exports stay free. | 8 | Pass; free-core claim. |
| Secure checkout by Sociobot / Dodo. | 5 | Pass; payment disclosure. |
| Refunds are handled by the merchant of record. | 8 | Pass; legal disclosure. |
| Stage bulk catalog edits safely | 5 | Pass; useful h1. |
| For collectors updating a chosen subset without losing the original catalog. | 10 | Pass; names audience and outcome. |
| Try it with sample data | 5 | Pass; permitted, result-naming demo action. |
| Loads 32 sample items in the review desk. | 9 | Pass; sample-catalog claim. |
| Catalog stays in your browser | 5 | Pass; local-data claim. |
| Works offline after first visit | 5 | Pass; offline-reload claim. |
| $19 once for Desk Plus | 5 | Pass; desk-plus-price claim. |
| Illustration of a local catalog review desk. | 7 | Pass; useful caption. |
| Map columns, stage changes, then export a patch CSV and undo CSV. | 12 | Pass. |
| Drop CSV here or browse | 6 | Pass; file-input label. |
| UTF-8 CSV · first row must be headings | 7 | Pass; input requirement fragment. |
| Optional thumbnails | 2 | Pass; useful heading fragment. |
| Select image files after the CSV. | 6 | Pass. |
| They are matched by filename and stay local. | 8 | Pass; local-thumbnail claim. |
| Review, stage, and export | 4 | Pass; useful process heading. |
| Search titles and IDs. | 4 | Pass. |
| Then filter collection, location, or condition. | 7 | Pass. |
| Select visible items. | 3 | Pass. |
| Stage one field at a time. | 6 | Pass. |
| Source rows stay unchanged. | 4 | Pass; source-rows-unchanged claim. |
| Export a patch CSV and an undo CSV with the original values. | 13 | Pass. |
| Your catalog stays in this browser. | 6 | Pass; local-data claim. |
| Generated field-desk illustration. | 3 | Pass; provenance label, but use “field desk” only as art description. |
| Built by Param Factory · v1.0.1 | 6 | Pass; required build label. |
| N 38° / DESK 01 | 4 | **Flag F-1-2:** decorative label with no user information. |

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| Stage bulk catalog edits safely for collectors with many physical items. | 11 | Pass. |
| Import a CSV, review a filtered subset, then export a patch and an undo CSV. | 15 | Pass. |
| The desk maps CSV headings, optionally matches local thumbnails by filename, filters visible records, and stages export-only changes. | 18 | Pass. |
| It exports a patch CSV and a separate undo CSV with original values. | 13 | Pass. |
| Blank and duplicate IDs are blocked. | 6 | Pass. |
| IDs such as `0007` remain strings throughout. | 7 | Pass. |
| Catalog data stays in the browser by default. | 8 | Pass; local-data claim. |
| Remote thumbnails stay off until explicitly enabled. | 7 | Pass; remote-thumbnails claim. |
| Core import, filtering, staging, undo, and export are free. | 9 | Pass; free-core claim. |
| Desk Plus is a $19 one-time license for automatic local workspace restore. | 12 | Pass; Desk Plus claims. |
| Open `/?demo=1` or select **Try it with sample data** on the first screen. | 12 | Pass. |
| It opens a 32-item catalog directly in the review desk. | 9 | Pass; sample-catalog claim. |
| Demo state uses the `demo:collection-bulk-curator:session` browser-storage namespace and never reads or overwrites a real Desk Plus session. | 16 | Pass; demo-isolation claim. |
| Use **Reset demo** to start the sample again or **Start for real** to discard it and import a CSV. | 18 | Pass. |
| Requires Node.js 20 or newer. | 5 | Pass; setup requirement. |
| Open the local URL printed by Vite. | 7 | Pass. |
| Use **Try it with sample data** for a complete no-file walkthrough, or open `/?demo=1` directly. | 15 | Pass. |
| Playwright `1.58.2` is pinned. | 4 | Pass. |
| The factory image includes its Chromium binary at `$PLAYWRIGHT_BROWSERS_PATH`; elsewhere run `npx playwright install chromium` once. | 16 | Pass. |
| Claim checks are listed in `.factory/claims.json`. | 6 | Pass. |
| Each command can be run by appending its grep tag. | 10 | Pass. |
| The exact deploy command is `npm run build`. | 8 | Pass. |
| It produces `dist/index.html`, `/privacy/`, `/terms/`, and a product-styled `404.html`. | 9 | Pass. |
| Deploy the contents of `dist/` to Azure Static Web Apps. | 10 | Pass. |
| `public/staticwebapp.config.json` supplies security, cache, and 404 response settings. | 7 | Pass. |
| CSV parsing supports UTF-8 BOMs, quoted commas, escaped quotes, and multiline fields. | 11 | Pass; csv-format-support claim. |
| Map your ID and optional title, thumbnail, tags, location, condition, and collection headings before opening the desk. | 17 | Pass. |
| Thumbnails may be attached as local image files and are matched against the mapped filename on desktop or mobile. | 18 | Pass; local-thumbnail claim. |
| Patch and undo exports contain the mapped ID heading and every changed field. | 12 | Pass. |
| The app has no analytics, ads, remote fonts, or third-party scripts. | 10 | Pass; no-tracking claim. |
| It uses browser storage for the theme, optional license token and verification cache, a Desk Plus workspace, and a separate resettable demo workspace. | 23 | **Flag F-1-3:** over 22 words. |
| Checkout and license verification use the Sociobot billing API. | 9 | Pass; implementation disclosure. |
| A staging build can set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1`. | 7 | Pass; setup instruction. |
| The source is MIT licensed. | 5 | Pass; repository fact. |
| The generated illustration provenance and full visual specification are in `.factory/design.md`. | 10 | Pass; documentation pointer. |

## Demo, privacy, and claims

- The direct demo URL `/?demo=1` opened a realistic 32-item catalog in one
  navigation. Its first screen was already the review desk, with the persistent
  **“Demo — sample data, nothing is saved”** banner, **Reset demo**, and
  **Start for real**.
- Reset restored 32 sample cards. In the declared isolation test, a seeded real
  session stayed unchanged before reset, after reset, and after leaving demo.
- A live request log for cold landing and demo contained only same-origin HTML,
  JS, CSS, and image requests. No cookies or console errors were observed.
  Remote thumbnails remained off until explicit opt-in in the declared test.
- All 20 `claims.json` tests passed from a fresh `npm ci` install. They were
  run in two grep groups covering every declared `@claim:` id; each group also
  ran the seven Vitest tests. The first group passed 10 Playwright tests in
  12.3 s; the second passed 10 in 12.0 s.
- No unlisted visitor-facing functional claim was identified after cross-checking
  the landing and README against `claims.json`. Payment, licensing, build, and
  provenance text is disclosure or setup documentation rather than an added
  product-capability promise.

## History check

The repository has no earlier `.factory/review-*.md` or `.factory/polish-*.md`.
The earlier `.factory/handoff.md` records a PASS rather than numbered findings,
so there are no earlier finding IDs to reconfirm. I independently re-ran this
checklist rather than relying on that handoff.

## Structure, accessibility, and visual checks

- `/`, `/?demo=1`, `/privacy/`, `/terms/`, the assets, sitemap, robots, and
  designed 404 returned the expected responses. A deliberately nonexistent URL
  returned the designed 404 with a route back.
- Titles, descriptions, canonical URLs, OG/Twitter metadata, favicon and apple
  icon, `lang`, one h1, main landmark, consistent header/footer, and Privacy /
  Terms links were present on the live routes. Browser Back then Forward between
  landing and demo restored the correct URL, title, banner, and screen.
- `/opt/fleet/lib/verify-url.sh` passed on the landing route: title, language,
  main, one h1, image alt text, labeled buttons, and zero console errors.
  Live Axe checks at 390 px found no serious or critical violations on landing,
  demo, Privacy, or Terms.
- The build passed and emits `dist/`; the initial JS is 12.83 kB gzip. The
  warm-paper survey-desk art, contour rules, and compact three-part desk are
  clearly product-specific rather than a generic SaaS card grid.
- The brief does not imply an omitted AI action, cloud sync, or other required
  leverage beyond the existing CSV import, thumbnail matching, local review,
  patch export, and undo export. An AI feature would be decorative here.

## What would make this perfect

Focus the new h1 after every route/screen change, remove the remaining
fieldwork-themed jargon and decorative coordinate label, and split the one
overlong privacy sentence. Then rerun the full copy audit, declared claim
suite, browser Back/Forward focus regression, build, and live accessibility
checks. With those three findings resolved, the product would be ready for a
zero-finding PASS.
