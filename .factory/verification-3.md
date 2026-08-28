# Independent verification 3 — FAIL

**Work order:** `collection-bulk-curator-verify-3`  
**Candidate:** `fc291527da19b8a0496484652afba58cd82fd914` (`main`)  
**Live URL:** <https://collection-bulk-curator.sociobot.in>  
**Verified:** 2026-08-28 UTC

## Release verdict

**FAIL — the candidate is deployed and its ordinary export path works, but a
release-blocking selection-scope defect can apply changes to rows that are no
longer visible. The primary file controls also have no visible keyboard focus.**

This is fresh verification from a clean candidate checkout. The earlier
deployment-only failure is not present: the live artifact byte-matches this
candidate, production checkout is enabled, and the service worker reloads the
complete product offline.

## Defects

### P1 — filtering can silently stage edits on an entirely hidden selection

The selection persists when search or filters change, even when none of the
selected records remains visible. The staging form then edits that hidden set.
This violates the researched job of changing a chosen subset “without losing
context” and the visual contract that says no hidden rows are silently
selected.

Exact live reproduction:

1. Open the 32-item sample and enter the review desk.
2. Filter Collection to **Field finds**: 11 items are visible.
3. Choose **Select visible**: the ledger reports 11 selected items.
4. Change Collection to **Paper archive**: 10 different items are visible and
   all 10 visible checkboxes are unchecked, but the ledger still reports 11
   selected items.
5. Stage any field. The result is 11 changed rows: the hidden Field finds, not
   any currently visible Paper archive item.

The exact count is visible, but the identities and scope are not; a user can
review one subset and apply the change to another. Clear selection when the
visible scope changes, constrain staging to visible selected rows, or keep an
explicit reviewable representation of the hidden selected set with a specific
confirmation.

### P1 — primary file controls have no visible keyboard focus

Both file inputs are keyboard-focusable but fully transparent, and neither
visible label receives a `:focus-within` treatment:

- On the import screen, Tab reaches `#csv-file`; it has `opacity: 0`, while its
  visible drop-zone label computes `outline: none`.
- In the workspace, Tab reaches `#image-files`; it has `opacity: 0`, while the
  visible **Add thumbnails** label computes `outline: none`.

The global 3 px outline is applied to the invisible input and is composited
away with it. A keyboard-only user therefore cannot see focus on the primary
import action or the thumbnail attachment action. Add a designed visible
focus indicator to the labels with `:focus-within` (and preserve activation by
keyboard).

### P2 — selecting an item by keyboard destroys focus

With the first item checkbox focused, pressing Space checks it and triggers a
full `innerHTML` render. The active element immediately becomes `BODY`.
Selecting another individual item therefore requires restarting navigation
from the beginning of the page. The same render-on-change pattern affects
other controls. Preserve or restore logical focus, or update selection state
without replacing the focused subtree.

### P2 — confirmed “Clear this local desk” leaves the paid workspace stored

Using a route-mocked valid license to exercise the paid branch, staging a
change created `collection-bulk-curator:session`. Accepting the **New catalog**
confirmation (“Clear this local desk and choose another catalog?”) returned to
the import screen but left that storage entry intact and immediately offered
**Resume local desk** for the supposedly cleared catalog. This contradicts
the confirmation and the design thesis's named local session-clearing action.
Remove the saved session when the user confirms clearing it, or rename and
separate the action so retention is explicit.

### P2 — staged-item removal target is 36×36 px on mobile

At 390×844, the ledger's **Remove all staged changes for …** button measures
36×36 CSS px. It is the only measured visible interactive target below the
contract's 44×44 px baseline in that state.

### P2 — hundred-item bulk selection misses the interaction budget

The app replaces the entire workspace DOM on selection. On the supplied
Chromium without CPU throttling:

- 500 visible records: **Select visible** took 92 ms synchronously and 411 ms
  to the second animation frame.
- 1,000 visible records at 390 px: it took 211 ms synchronously and 588 ms to
  the second animation frame; opening the initial workspace took 1,258 ms.

The target user has hundreds of items, and this already exceeds the <200 ms
INP budget before mid-range-phone throttling. Incremental rendering or list
virtualization is needed for the advertised catalog scale.

### P3 — mobile workspace has a moderate heading-order violation

Axe reports `heading-order` when the mobile change ledger is open. With the
filter rail inert, item-card `h3` elements follow the page `h1` without an
active `h2`. This is not serious/critical, but it conflicts with the semantic
heading-order baseline.

## Evidence

### Clean install, repository gates, and production build

- The worktree began clean at exactly
  `fc291527da19b8a0496484652afba58cd82fd914`; `origin/main` resolved to the
  same commit.
- `npm ci`: passed, 61 packages installed, 0 vulnerabilities.
- `npm test`: passed — 6 Vitest tests and 14 Chromium Playwright tests.
- `npm run build`: passed — strict TypeScript `--noEmit` and the exact Vite
  production build. No separate lint script exists.
- `npm audit --omit=dev`: passed with 0 vulnerabilities.
- Fresh production output: JS 33,250 bytes / 11.46 KB gzip; CSS 18,547 bytes /
  5.14 KB gzip; no font payload; mobile AVIF 18,331 bytes; full AVIF 82,344
  bytes. `dist/` is 448 KB and contains `index.html`, legal pages, and the
  service worker. All stated static budgets pass.

### Functional and recovery coverage

- Imported a BOM-prefixed, CRLF catalog with arbitrary headings, leading-zero
  IDs, quoted commas, escaped quotes, and a multiline field.
- Filtered 27 Archive rows; added/deduplicated two tags, cleared condition,
  and set location. The patch and undo files each contained exactly 27 rows,
  headings `SKU,Keywords,Place,Grade`, and verbatim IDs `0001` through `0027`.
  Undoing the latest batch reduced field edits from 81 to 54.
- A 500-row catalog opened, filtered to 125 rows, staged all 125, and exported
  successfully. The larger interaction timings are recorded as a defect
  above.
- Recovery messages were verified for empty, headings-only, one-column,
  duplicate-heading, unclosed-quote, over-15 MB, whitespace-only ID,
  duplicate-ID, repeated semantic mapping, and whitespace-only stage value.
  Valid input worked immediately after the errors.
- Empty filtered results explained how to recover and **Clear filters** did so.
- Local thumbnail matching produced a rendered blob image. A remote image URL
  caused zero requests before opt-in and exactly one request after opt-in.

### Privacy, licensing, and outbound traffic

- A fresh free workflow made zero third-party requests, set no cookies, and
  left local storage empty. Static inspection found no analytics, ads, remote
  fonts, or third-party runtime scripts.
- The production buy endpoint returned HTTP 303 to Dodo checkout. The hosted
  page returned 200 and displayed **Collection Batch Desk Plus**, **$19.00**,
  and the one-time unlock description. No purchase was submitted.
- A real live invalid-token return stored the token under
  `sb_license:collection-bulk-curator`, removed only `license` from the URL,
  retained the other query and hash, called the production verifier once, and
  remained locked. The verifier returned HTTP 200 with
  `{valid:false, reason:"invalid"}`, `Cache-Control: no-store`, and the correct
  product-origin CORS header.
- Valid-license persistence and the clear-session defect were tested by
  intercepting only the verifier response; no production entitlement was
  fabricated or written outside the disposable browser context.

### Accessibility, responsive behavior, and browser errors

- `/opt/fleet/lib/verify-url.sh` passed locally and live after providing its
  required output directories. Live load: 616 ms; title, `lang=en`, one `h1`,
  `main`, image alt, labeled buttons, and zero console/page errors.
- Independent axe scans on desktop import (light/dark), mapping, workspace,
  mobile import (light/dark), mobile workspace/ledger, privacy, and terms found
  **zero serious or critical findings**. The one moderate issue is listed
  above.
- At 390×844 there was no horizontal overflow at normal text sizing. The
  filter and ledger drawers accepted focus, closed with Escape/the close
  button, and returned focus to their triggers. The ordinary mobile workflow,
  local thumbnails, and exports remained reachable.
- The skip link is the first Tab stop, has a visible 3 px outline, and moves
  focus to `main`. Ordinary visible controls have the same designed ring; the
  transparent file controls are the exception described above.
- With `prefers-reduced-motion: reduce`, item transitions compute to `1e-05s`
  and hover transforms are removed.
- All tested desktop/mobile flows completed with zero console errors, page
  errors, or unexpected failed requests.

### Deployment identity, response policy, PWA, and performance

- Fresh local `dist/` and live `index.html`, hashed JS, JS source map, CSS,
  service worker, privacy, terms, legal CSS, favicon, robots, sitemap, and all
  four illustration files byte-match. Example SHA-256 values:
  `index.html` `a15bc8e3…d6340a`, JS `7820deb6…419ea`, and `sw.js`
  `5d143fad…16618`. The live deployment is this candidate.
- HTTP redirects to HTTPS. Root and legal HTML return 200 with 30-second
  revalidation; hashed JS/CSS use one-year immutable caching; `sw.js` uses
  `no-cache`; an unknown route returns 404.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, and CSP restricting scripts/styles to
  self, framing to none, objects to none, and connections to self plus the two
  documented Sociobot API origins.
- Service-worker registration and explicit update passed. A controlled 390 px
  browser then reloaded the full shell and responsive hero offline, displayed
  **Offline · local tools still work**, and emitted zero failed requests,
  console errors, or page errors.
- Fresh Lighthouse 12.8.2 mobile against live: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT
  10 ms, CLS 0, Speed Index 0.9 s, TTI 1.4 s. This initial-screen result does
  not cover the large-workspace interaction defect above.

## Applicability and scope

This is a static browser product, not a library, CLI, or backend; consumer
pack/install, server concurrency, database persistence, and health/build
identity probes do not apply. No product code or deployment was changed.
