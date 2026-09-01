# Independent verification 6 — FAIL

- **Work order:** `collection-bulk-curator-verify-6`
- **Candidate:** `f0f0b3ba0b4b02b3d1e0f6846760bc10064e4490` (`main`)
- **Live URL:** <https://collection-bulk-curator.sociobot.in>
- **Verified:** 2026-09-01 UTC

## Release verdict

**FAIL — release-blocking acceptance-contract findings remain.** The live
deployment byte-matches the candidate, all eight declared claim tests pass,
and the core local batch-edit workflow works. The candidate still fails the
required mobile first-read test, does not list every published claim in the
claims manifest, does not save a newly opened paid workspace, and omits
mandatory route and metadata elements.

## Release-blocking findings

### P1 — the primary sample action is not on the first mobile screen

At 390 × 844, the opening viewport clearly says what the product does and who
it is for:

> Stage bulk catalog edits safely
>
> For collectors updating a chosen subset without losing the original catalog.

It does not show what to click first. The required **Try it with sample data**
button starts at y = 1102.66 px, 258.66 px below the viewport. The opening
screen ends partway through the illustration and shows only the theme and
license controls as actions. At 1440 × 900, the sample button is visible at
y = 764.67 px. The demo itself is one click and works once reached.

Evidence: `.factory/qa-artifacts/live-cold-mobile-viewport.png`.

### P1 — published claims are missing from `.factory/claims.json`

The manifest lists eight claims and each has exactly one passing tagged test.
It does not cover all statements a visitor is asked to rely on. Examples:

- README: arbitrary heading mapping, local thumbnail filename matching, blank
  and duplicate ID checks, and support for BOMs, quoted commas, escaped quotes,
  and multiline fields.
- Desk Plus copy and terms: automatic local workspace save and restore.
- Privacy page: license verification occurs at most once daily; no analytics,
  ads, tracking pixels, cookies, or third-party runtime scripts.
- Landing page: search/filter behavior and unchanged source rows.

Some have ordinary regression coverage, but they are not manifest entries with
one corresponding `@claim:<id>` test. The structural Vitest check only verifies
manifest-to-test mapping; it does not check published-copy-to-manifest coverage.
The supplied claims contract says any unlisted claim fails review.

### P1 — a newly opened Desk Plus workspace is not saved

The paid copy promises: **“Automatically save and restore your local workspace
next visit.”** With a valid mocked verifier response, I imported `paid.csv` and
opened the review desk. `localStorage['collection-bulk-curator:session']`
remained `null`. The product writes the workspace only after a change is staged,
removed, or undone. Closing before the first edit therefore leaves nothing to
restore. The existing paid-session test stages an edit before checking storage,
so it does not cover this boundary.

### P1 — mandatory site routes and metadata are incomplete

- `/`, `/?demo=1`, `/privacy/`, and `/terms/` have no canonical URL, Open Graph
  title/image, Twitter card metadata, or Apple touch icon. No 1200 × 630 social
  image ships.
- The demo keeps the root title, `Collection Batch Desk — reversible bulk
  catalog edits`, instead of a demo-specific title.
- An unknown path and `/404.html` return the generic **Azure Static Web Apps —
  404: Not found** page. There is no product-styled 404 or `responseOverrides`
  entry in `staticwebapp.config.json`.
- Privacy and terms omit the standard skip link and consistent product header.
  The main footer omits “Built by Param Factory” and a version/build ID.

These are mandatory in the supplied site-structure contract.

## Other findings

### P2 — some mobile touch targets are below 44 px

At 390 px, **Reset demo** and **Start for real** are each 36 px high. The
**Load remote image URLs** label is 26 px high when the filter drawer is open.
The item checkbox itself is 20 px, but its enclosing label correctly provides a
44 × 44 px target. The smaller controls do not meet the 44 px baseline.

### P2 — large-catalog mobile toolbar overflows horizontally

With a representative 1,000-row CSV at 390 px, the product progressively
renders 120 items and selects all matching rows in 40.6 ms. Once selected, the
three toolbar actions end at x = 398.39 px, making the document 398 px wide in
a 390 px viewport. Evidence:
`.factory/qa-artifacts/live-mobile-1000-selected.png`.

## Required claims gate

The literal commands were first invoked before dependency installation, as
requested; they could not start because `node_modules` was absent
(`vitest: not found`, exit 127). After `npm ci`, every exact command from
`.factory/claims.json` passed from the clean candidate:

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `local-data` | PASS | Demo edit produced only same-origin requests and did not write the real session key. |
| `remote-thumbnails` | PASS | No remote image request before consent; one fixture request after consent. |
| `exact-ids` | PASS | Patch bytes retained `0001`. |
| `patch-csv` | PASS | Patch header and changed row matched exactly. |
| `undo-manifest` | PASS | Undo bytes contained the original location. |
| `demo-isolation` | PASS | Reset/exit changed only the `demo:` namespace. |
| `offline-reload` | PASS | Dedicated context reloaded the populated demo offline. |
| `desk-plus-price` | PASS | `$19` one-time copy and Sociobot checkout route were present. |

Each command ran 7 passing Vitest tests plus its one selected Chromium test.
Full output: `.factory/qa-artifacts/claims.log`.

## Repository gates

- Clean starting SHA: exact candidate `f0f0b3ba0b4b02b3d1e0f6846760bc10064e4490`.
- `npm ci`: PASS — 61 packages installed; 0 vulnerabilities reported.
- `npm test`: PASS — 7 Vitest tests and 29 Chromium tests.
- `npm run build`: PASS — `tsc --noEmit`, Vite production build, and service
  worker generation; `dist/` produced.
- `npm audit --omit=dev`: PASS — 0 vulnerabilities.
- No lint script or separate lint configuration exists. Type checking is part
  of the exact build.

## Independent product exercise

The live `/?demo=1` route opened 32 items with the persistent demo banner. I
filtered to the 11 **Field finds** items, selected the visible subset, added
`priority, fragile`, exported patch and undo CSVs, and used batch undo. The
patch contained 11 rows and retained the zero-padded `0001`; the undo file held
the original tags. Undo disabled patch export. Reset restored all 32 items;
Start for real removed the demo key while preserving a seeded real-session
sentinel.

A separate real-data flow imported quoted commas, a multiline title, and IDs
`0007`/`0008`; it exported exact patch bytes
`ID,Location / 0007,Archive room` and undo bytes
`ID,Location / 0007,Shelf 2` (with the expected UTF-8 BOM and CRLFs).

Empty input, headings-only input, one-column input, an unfinished quoted field,
and duplicate headings each produced specific recovery guidance. A valid file
immediately after those errors reached the workspace. A file one byte above
15 MiB was declined with the documented split-file guidance. The full suite
also confirms duplicate IDs, blank IDs, duplicate semantic mappings, local
thumbnails, 1,000-row progressive rendering, filter-scope selection safety,
clear-session confirmation, and service-worker upgrade behavior.

## Privacy, responses, billing, and deployment identity

- A cold root load requested only the root, local JS/CSS, and local illustration.
  The independent demo edit/export flow also contacted only
  `collection-bulk-curator.sociobot.in`. There were no console or page errors.
- Root responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`,
  strict-origin referrer policy, and a restrictive permissions policy.
- HTML revalidates after 30 seconds; hashed assets use one-year immutable
  caching; `sw.js` uses `no-cache`.
- Fresh `dist/` files byte-match live root HTML, JS, CSS, illustration variants,
  service worker, legal pages, robots, sitemap, and favicon by SHA-256.
- The checkout endpoint returned HTTP 303 to the hosted Dodo checkout; the
  external destination was not followed.
- From one client, the license verifier returned 200 for requests 1–30 and 429
  on request 31 with `Retry-After: 4`. Observed allowance: 30 requests in the
  current window.
- This product has no sign-in and no product-owned backend. Entra and backend
  persistence/concurrency checks are not applicable.

## Accessibility, PWA, and performance

- Independent Axe 4.13.0 scans found zero serious/critical findings—and zero
  findings at any impact—on root light, root dark, populated demo desktop,
  populated demo mobile, privacy mobile, and terms mobile.
- Keyboard-only checks confirmed a visible 3 px focus ring, working skip link,
  Enter activation of the demo, Space selection, and Escape/focus return for
  both mobile drawers. There were no keyboard traps.
- At 200% root font size the 390 px demo had no horizontal overflow. Reduced
  motion computed transitions/animations to `0.00001s` and scroll behavior to
  `auto`.
- Live service-worker control used `/sw.js` and cache
  `collection-batch-desk-rf0f0b3ba0b4b-e1688e645ac2`. A populated 390 px demo
  reloaded offline with 32 cards, the demo banner, and the offline status.
- Lighthouse 12.8.2 mobile: Performance 98, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.83 s, LCP 2.03 s, TBT 0 ms, CLS 0; total transfer
  102,296 bytes.
- Production output: JS 37,278 B / 12.35 kB gzip; CSS 19,534 B / 5.30 kB gzip;
  mobile AVIF 18,331 B; no font payload. Static budgets pass.
- URL verifier: 200, `lang=en`, one h1, main landmark, no missing image alt,
  no unlabeled buttons, and no console/page errors. Evidence is under
  `.factory/evidence/verification-6-live/`.

## Scope note

No product code, deployment, infrastructure, secret, database, or unrelated
resource was read or changed. This report and its evidence are the only changes
made by verification.
