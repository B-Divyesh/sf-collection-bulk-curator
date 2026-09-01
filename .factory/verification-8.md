# Independent verification 8 — FAIL

- **Work order:** `collection-bulk-curator-verify-8`
- **Candidate:** `1e5f284a1dfa3c28a1adb8330dd840977cd30f78` (`main`)
- **Live URL:** <https://collection-bulk-curator.sociobot.in>
- **Checked:** 2026-09-01 UTC

## Release result

**FAIL — one release-blocking mobile accessibility defect remains.** The
candidate and live deployment otherwise pass the claims gate, first-read test,
core workflow, privacy checks, repository gates, Axe scans, offline checks, and
performance budgets.

## Finding

### P1 — the workspace does not reflow at 200% text size on a 390 px screen

Confirming the required text-resize behavior at 390 × 844 found horizontal
overflow in both the start page and populated workspace. With the root text
size set to 200%, the start page measures 396 px wide in a 390 px viewport. The
demo workspace measures **496 px wide in a 390 px viewport**.

The closed fixed-position `.ledger` remains part of the horizontal overflow,
and the non-wrapping footer build label also exceeds the viewport. The
full-page capture shows clipped item content and part of the closed staging
panel at the right edge. A user must pan sideways to read and operate the
layout. This does not meet the supplied requirement that text resize to 200%
without loss in the mobile experience.

Reproduction:

1. Open `https://collection-bulk-curator.sociobot.in/?demo=1` at 390 × 844.
2. Select one item so the mobile staging action is available.
3. Increase the root text size to 200%.
4. Check `document.documentElement.scrollWidth` and `clientWidth`.

Observed: `{ "scrollWidth": 496, "clientWidth": 390 }`.

Evidence:
`.factory/evidence/verification-8-live/workflow-mobile-200-percent.png` and
`.factory/evidence/verification-8-live/live-qa.json`.

Recommended correction: keep closed fixed panels out of horizontal overflow,
allow the footer version label to wrap at narrow text layouts, and add a 390 px
200%-text regression that requires `scrollWidth <= clientWidth` on both the
start page and populated demo.

## Required first-read check

**PASS.** A cold live visit at 1440 × 900 and 390 × 844 immediately answers all
three questions in plain words:

- What it does: **Stage bulk catalog edits safely**.
- Who it is for: collectors updating a chosen subset without losing the
  original catalog.
- What to do first: **Try it with sample data**, with “Loads 32 sample items in
  the review desk” beside it.

At 390 px the sample action spans y=326.28–373.06 px, fully inside the opening
844 px viewport. One activation opens 32 sample cards and the persistent
**Demo — sample data, nothing is saved** banner.

## Required claims gate

The clone initially had no installed packages, so the first direct claim
command stopped before test collection with `vitest: not found`. After the
required locked install with `npm ci`, every exact command in
`.factory/claims.json` passed. Each command ran the seven Vitest checks and its
single selected Chromium claim check.

| Claim | Result | Confirmed outcome |
| --- | --- | --- |
| `sample-catalog` | PASS | One action opened 32 sample items at 390 px. |
| `local-data` | PASS | Demo edits stayed same-origin and did not write the real workspace key. |
| `remote-thumbnails` | PASS | The remote image stayed off until explicit consent. |
| `exact-ids` | PASS | The patch retained `0001` byte-for-byte. |
| `patch-csv` | PASS | A staged location appeared in the patch CSV. |
| `undo-manifest` | PASS | The undo CSV contained the original location. |
| `demo-isolation` | PASS | Demo reset and exit preserved a real-session sentinel. |
| `offline-reload` | PASS | A dedicated 390 px context reloaded the populated demo offline. |
| `desk-plus-price` | PASS | The page showed $19 once and the hosted checkout route. |
| `desk-plus-session` | PASS | A verified local workspace saved and restored after reload. |
| `daily-license-check` | PASS | Reload within the daily cache made no second license request. |
| `license-request-boundary` | PASS | The check used GET with only the license query value, an empty body, and no catalog marker. |
| `no-tracking` | PASS | Demo use stayed same-origin and stored no cookies. |
| `csv-heading-mapping` | PASS | Nonstandard headings mapped into the review desk. |
| `csv-format-support` | PASS | BOM, quoted commas, escaped quotes, and multiline fields opened correctly. |
| `id-validation` | PASS | Blank and duplicate IDs received correction guidance. |
| `local-thumbnail-matching` | PASS | A local image matched by filename and rendered from a blob URL. |
| `filter-visible-results` | PASS | Search narrowed the sample to the expected eight cards. |
| `source-rows-unchanged` | PASS | The undo file retained the source value after staging. |
| `free-core-workflow` | PASS | An unsigned user imported, staged, and exported a patch. |

The live page, README, privacy notice, terms, and claims manifest were
cross-checked. No additional unlisted visitor-facing product claim was found.
The local-thumbnail privacy statement is supported by blob rendering plus the
same-origin request checks.

Claim status evidence:
`.factory/evidence/verification-8-live/claims-status.tsv`.

## Repository and build checks

- Confirmed the clean starting SHA was the exact candidate.
- `npm ci`: PASS — 61 packages installed and 0 audit findings.
- `npm test`: PASS — 7 Vitest tests and 45 Chromium Playwright tests.
- `npm run build`: PASS — strict TypeScript, Vite build, and service-worker
  generation produced `dist/`.
- `npm audit --omit=dev`: PASS — 0 findings.
- No lint script or separate lint configuration exists. Type checking is part
  of the exact production build.
- Initial JavaScript: 39,024 B, 12,671 B gzip.
- Initial CSS: 21,305 B, 5,543 B gzip.
- Mobile AVIF hero: 18,331 B; no font payload.

## Independent product workflow

Confirming the live demo opened 32 realistic catalog items. Filtering to
**Field finds** produced 11 visible items. Selecting those items, adding the
tags `priority, fragile`, and exporting produced one heading plus 11 patch
rows. The patch retained `0001`; the undo file contained one heading plus 11
original rows. Batch undo disabled export again.

Confirming recovery paths covered an empty file, headings-only file,
unfinished quoted field, 15 MiB plus one byte file, duplicate IDs, and blank
IDs. Each case produced specific correction guidance. A valid BOM CSV with a
quoted comma, multiline field, and mapped nonstandard headings opened after
those errors. Its exact patch was `Ref,Grade / 0007,Excellent` with the BOM and
CRLF bytes intact.

The complete local suite additionally confirms repeated semantic mapping,
local thumbnail attachment, all staged-field plumbing, 1,000-row progressive
rendering and bulk selection, selection reset after filter changes, confirmed
session clearing, paid-session restore, and service-worker replacement.

## Privacy, response policy, and billing checks

- The independent demo review and export made four requests, all to
  `collection-bulk-curator.sociobot.in`; it stored no cookies and wrote no real
  workspace key.
- A separately observed license check used `GET`, had only
  `license=verification-8-license` in its query, had no body, included no seeded
  catalog marker, and removed the token from the visible URL.
- An actual invalid license response returned 200 with `valid:false`, the
  product remained usable, the browser stored no cookies, and no console or
  page errors occurred.
- Confirming the documented request allowance found requests 1–30 returned
  200. Request 31 returned 429 with `Retry-After: 3`. The observed allowance is
  30 requests in the current window.
- The checkout URL returned 303 to the hosted Dodo checkout. The destination
  was not followed.
- Browser response headers confirmed HSTS, `nosniff`, strict-origin referrer
  policy, disabled camera/microphone/geolocation/payment permissions, and a CSP
  with `frame-ancestors 'none'`.
- Root HTML uses 30-second revalidation, hashed assets use one-year immutable
  caching, and `sw.js` uses `no-cache`.

## Routes, accessibility, offline behavior, and performance

- `/`, `/?demo=1`, `/privacy/`, `/terms/`, and the not-found page have distinct
  titles, `lang=en`, one h1, one main landmark, complete image alternatives,
  canonical metadata, and product social metadata.
- All discovered first-party routes and assets returned 200. An unknown route
  returned the styled page with HTTP 404. The source link returned 200.
- The factory URL check passed locally and live with zero root-page console or
  page errors, labeled buttons, and complete basic semantics.
- Axe found zero serious or critical findings on the start page in light and
  dark treatment, the demo, privacy, terms, and the not-found page.
- Keyboard checks confirmed first-position skip navigation, visible 3 px focus,
  Enter activation, Space selection with retained focus, drawer focus entry,
  Escape closure, and focus return. Visible mobile controls had at least 44 px
  effective targets. No keyboard trap was found.
- Reduced-motion mode limited transition and animation durations to 0.01 ms.
  No looping or flashing motion was observed.
- The live service worker controlled the page with cache
  `collection-batch-desk-r1e5f284a1dfa-46fda00ce803`. The 32-item demo reloaded
  offline, and its 390 px offline status remained visible with no console or
  page errors.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 20 ms, CLS 0; transfer 103,178 B.

The 200% text-size finding remains release-blocking despite the passing
automated accessibility scores.

## Deployment identity

Fresh production output and live bytes match exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `1c2130c736908314790531f20c6c53661f15003ad08aa9dab6e2fb326a5ef204` |
| `assets/index-WqHVlqZ-.js` | `629f7a902615f612a87bfa8a3c26feb4909c59185848e0448278f89eafef9054` |
| `assets/style-BueDvLhl.css` | `a986259f4fe970110b45f429628e3df9914cbc5e9ddf0fa29f7da389e5f26b37` |
| `sw.js` | `cfe24c84e9eb3e40dee60ac13481292188a0a2b831438d250ade7a1e29378447` |

The service-worker cache name also embeds the candidate prefix. This confirms
that the tested live deployment matches candidate `1e5f284a…`.

## Scope

This is a static local-first product with no product-owned backend, database,
sign-in, or package interface. Backend concurrency, persistence service,
identity-provider, health endpoint, and clean-consumer package checks do not
apply. No product code, deployment, infrastructure, secret, database, or
unrelated service was read or changed.
