# Independent verification 7 — FAIL

- **Work order:** `collection-bulk-curator-verify-7`
- **Candidate:** `225885557b0c32111d6646b6f50801c81e4d84e0` (`main`)
- **Live URL:** <https://collection-bulk-curator.sociobot.in>
- **Verified:** 2026-09-01 UTC

## Release verdict

**FAIL — one release-blocking claims-contract finding remains.** All 19
declared claim commands pass, the first-read requirement passes, the complete
local suite and production build pass, the live files byte-match the candidate,
and the useful catalog workflow works. The privacy notice also makes a
specific data-content promise that is not listed and tested as a claim. The
supplied claims contract says an unlisted public claim fails verification.

## Findings

### P1 — the license-request privacy promise is not a declared claim

The live privacy notice says:

> The app sends only a license token to Sociobot for access checks, at most
> once each day. It does not send catalog content with that check.

`.factory/claims.json` declares and tests the once-per-day part as
`daily-license-check`. It has no claim entry for the promise that the request
contains only the license token and no catalog content. Its tagged test counts
requests but does not inspect the request method, query keys, or body.
`local-data` exercises an ordinary demo edit and does not exercise a license
request. This is an unlisted claim under the supplied claims contract.

The current implementation behaved as promised during this review: an
intercepted live-page request was `GET .../verify?license=qa-token` with no
request body, and the page removed the token from the visible URL. The finding
is the missing manifest entry and tagged observable assertion, not a detected
catalog disclosure. Add a claim and one `@claim:` test that confirms the exact
method, allowed query parameter, and empty body.

### P2 — the persistent offline status is hidden on phones

At 390 × 844, a populated 32-item demo reloads successfully while offline.
`navigator.onLine` is false and `.offline-chip` contains **Offline · local
tools still work**, but the phone breakpoint applies `display: none`. A user
who opens or reloads while already offline receives no persistent visible
offline state. The connection-change toast appears only when the state changes
without a reload.

Evidence: `.factory/evidence/verification-7-live/independent-checks.json`
records `offlineStatus.display: "none"`. Keep the status visible in the phone
layout or provide an equivalent persistent status near the demo banner.

## Required first-read check

**PASS.** A cold live visit at both 1440 × 900 and 390 × 844 immediately shows:

- What it does: **Stage bulk catalog edits safely**.
- Who it is for: collectors updating a chosen subset without losing the
  original catalog.
- What to do first: **Try it with sample data**, followed by “Loads 32 sample
  items in the review desk.”

At 390 × 844 the sample action starts at y=326 px and is fully inside the
opening viewport. One activation opens 32 sample cards and the persistent demo
banner.

## Required claims gate

After `npm ci`, every exact command in `.factory/claims.json` passed from the
clean candidate. Each command ran the seven Vitest checks and its selected
Chromium claim check.

| Claim | Result | Confirmed outcome |
| --- | --- | --- |
| `sample-catalog` | PASS | One action opened 32 sample items at 390 px. |
| `local-data` | PASS | The demo edit stayed same-origin and did not write the real desk session. |
| `remote-thumbnails` | PASS | The remote image stayed off until explicit consent. |
| `exact-ids` | PASS | The patch retained `0001` byte-for-byte. |
| `patch-csv` | PASS | The staged location edit appeared in the patch CSV. |
| `undo-manifest` | PASS | The undo CSV contained the original location. |
| `demo-isolation` | PASS | Demo reset and exit preserved the real-session sentinel. |
| `offline-reload` | PASS | A dedicated demo context reloaded with its data offline. |
| `desk-plus-price` | PASS | The page showed $19 once and the hosted checkout route. |
| `desk-plus-session` | PASS | A verified desk saved immediately and restored after reload. |
| `daily-license-check` | PASS | Reload within the daily cache made no second check. |
| `no-tracking` | PASS | Demo use stayed same-origin and set no cookies. |
| `csv-heading-mapping` | PASS | Nonstandard headings mapped into the review desk. |
| `csv-format-support` | PASS | BOM, quoted comma, quote escape, and multiline input opened. |
| `id-validation` | PASS | Blank and duplicate IDs received clear correction guidance. |
| `local-thumbnail-matching` | PASS | A local image matched by filename and rendered from a blob URL. |
| `filter-visible-results` | PASS | Search narrowed the visible sample cards to the expected eight. |
| `source-rows-unchanged` | PASS | The undo file retained the source value after staging. |
| `free-core-workflow` | PASS | An unsigned user imported, staged, and exported a patch. |

The cross-check of live copy, README, privacy, and terms found the additional
license-request statement described above, so the overall claims gate fails.

## Repository gates

- Confirmed the clean starting SHA was the exact candidate.
- `npm ci`: PASS — 61 packages installed; audit reported 0 vulnerabilities.
- `npm test`: PASS — 7 Vitest tests and 44 Chromium Playwright tests.
- `npm run build`: PASS — strict TypeScript, Vite build, and service-worker
  generation produced `dist/`.
- `npm audit --omit=dev`: PASS — 0 vulnerabilities.
- No lint script or separate lint configuration is present. Type checking is
  part of the exact production build.
- Production output: JavaScript 38,975 B / 12.78 kB gzip; CSS 21,001 B / 5.51
  kB gzip; no font payload. These are within the supplied budgets.

## Independent workflow and recovery checks

The live demo opened 32 realistic items. Filtering to **Field finds** produced
11 items. Selecting the visible set, adding `priority, fragile`, and exporting
produced a patch with one heading row and 11 changed rows. The zero-padded
`0001` ID remained intact. The undo CSV contained 11 original rows, and batch
undo disabled patch export again.

A separate real import confirmed UTF-8 BOM input, a quoted comma, a multiline
field, exact IDs, staging, and exact patch bytes:
`ID,Location / 0007,Archive room`. The app recovered immediately after empty,
headings-only, unfinished-quote, duplicate-ID, blank-ID, and 15 MiB plus one
byte inputs. Each invalid case gave a specific next step.

The complete suite also confirms duplicate semantic mapping recovery, local
thumbnail matching, 1,000-row progressive rendering and selection, safe
selection reset after filters change, confirmed session clearing, paid-session
restore, and service-worker replacement from the previous fixture.

## Privacy, responses, routes, and license service

- The independent demo and real-import flow made five requests, all to
  `collection-bulk-curator.sociobot.in`; it set no cookies and produced no
  console or page errors.
- Browser response headers confirmed CSP with `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, and a restrictive permissions
  policy.
- Root and legal HTML use 30-second revalidation; hashed JavaScript and CSS use
  one-year immutable caching; `sw.js` uses `no-cache`.
- `/`, `/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` have route-specific
  titles, canonical URLs, social metadata, one h1, and a main landmark. All
  discovered internal links returned 200. An unknown route returned the
  product-styled page with HTTP 404.
- The checkout route returned HTTP 303 to the hosted Dodo checkout. The
  destination was not followed.
- From one client, license checks 1–30 returned 200. Check 31 returned 429 with
  `Retry-After: 3`. Observed allowance: 30 requests in the current window.
- This static product has no sign-in or product-owned backend. Identity-provider,
  database, health, concurrency, and package-consumer checks do not apply.

## Accessibility, mobile, PWA, and performance

- The factory URL check confirmed HTTP 200, title, `lang=en`, one h1, main,
  complete image alt text, labeled buttons, and zero console/page errors.
- Axe scans found zero findings of any impact on root light, root dark, demo
  phone light/dark, privacy phone, terms phone, and the not-found phone page.
- Keyboard checks confirmed the skip link, Enter sample activation, Space item
  selection with retained focus, filter and ledger focus entry, Escape close
  with focus return, and a visible solid focus outline. No keyboard trap was
  observed.
- Effective phone targets for navigation, demo actions, remote-image control,
  item selectors, and drawer controls are at least 44 px. The 390 px workspace
  has no horizontal overflow at 200% root text size.
- Reduced-motion mode computes control transitions to `0.00001s`. No looping
  or flashing motion was observed.
- The live service worker controls the page and uses cache
  `collection-batch-desk-r225885557b0c-b1117a4af5be`. A populated demo reloads
  offline with all 32 items and no console/page errors. The hidden phone status
  is the P2 finding above.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 10 ms, CLS 0; total transfer 103,119
  B with no third-party or font transfer.

## Deployment identity

Fresh `dist/` and live bytes match for root HTML, JavaScript, CSS, service
worker, four illustration formats, favicon, Apple touch icon, social image,
legal stylesheet, privacy, terms, 404, robots, and sitemap. Representative
hashes:

- `index.html`: `cdd79ea659919f612782ff3e83ca440ecd2a67b5c01854aadd170b9b5713f71a`
- `assets/index-DJi5P0aZ.js`: `6e8d4fdc6c37a9d72f6955f814d5bc1bd8b10a187a597b5d805263e13c2c7b6c`
- `assets/style-CvgORTo_.css`: `a2f9bb8ad9ac57002bac60828f2b454746a213ef8d7cec063d95b74315c3ae89`
- `sw.js`: `4a7a49daca3b2d232435b19f3d39e0faba6205bd35b95d1f3ad1efe952eb63b7`

Evidence is in `.factory/evidence/verification-7-live/`.

## Scope note

No product code, deployment, infrastructure, secret, database, or unrelated
service was read or changed. Verification changed only this report, the
handoff, and product-specific QA evidence.
