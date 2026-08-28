# Independent verification 2 — FAIL

**Work order:** `collection-bulk-curator-verify-2`  
**Candidate:** `de9d8c0162004440e160ddd7dd3b5b636ae0976d` (`main`)  
**Live URL:** https://collection-bulk-curator.sociobot.in  
**Verified:** 2026-08-28 UTC

## Release verdict

**FAIL — two release-blocking product defects remain.** The previously reported
390 px accessible-name defect is repaired, and the deployed files match the
candidate, but an allowed column mapping can corrupt the required row ID in
exports. Separately, the live paid purchase path points at the pilot API and
returns 404, so the advertised one-time Desk Plus purchase cannot be completed.

## Defects

### P1 — a repeated source-column mapping corrupts the patch ID

The mapping form permits the required item ID column to be selected for an
editable field. Export then creates duplicate headings through an object whose
later field value overwrites the ID value.

Exact live reproduction:

1. Import `ID,Title,Tags\n0007,Vase,ceramic`.
2. Leave Item ID mapped to `ID`, map Tags to `ID`, and open the desk.
3. Select the item, add tag `priority`, and export the patch.
4. Actual file bytes after the UTF-8 BOM:

   ```text
   ID,ID
   "0007, priority","0007, priority"
   ```

The identifier `0007` is absent as a standalone ID in both output columns. An
importer cannot safely target the source row. This violates the brief's
requirement to retain original row IDs verbatim and undermines the primary
patch/undo safety promise. The mapper must reject repeated semantic mappings,
at minimum any reuse of the ID column, and export must defend against duplicate
output headings.

### P1 — live Desk Plus checkout is unavailable

- The live **Buy once** link is
  `https://pilot-api.sociobot.in/api/v1/products/collection-bulk-curator/checkout`,
  not the required production API URL.
- A fresh GET to that exact link returns HTTP 404 with
  `{"error":"enabled factory product","status":404}` instead of redirecting
  to hosted checkout.
- The candidate production bundle contains the pilot URL. The equivalent
  production checkout URL also returned 404, indicating that registration or
  enablement is not complete either.

The free desk remains usable, but the advertised $19 one-time unlock cannot be
purchased. A successful hosted-checkout redirect and the returned-license flow
must be verified on the live product before release.

### P2 — whitespace-only IDs bypass blank-ID safety

`ID,Title\n   ,No usable ID` opens the review workspace with no warning. The
README says blank IDs are blocked, and a spaces-only identifier is not a safe
patch target. Validate IDs after a whitespace-only check while retaining the
original nonblank bytes for export.

### P2 — required mobile target sizing is incomplete

At 390 px, direct bounding-box measurement found the brand/home link 40 px
high and the standalone footer Privacy, Terms, and Source links about 20 px
high. The legal-page return link is also 20 px high. These do not meet the
contract's 44×44 CSS px touch-target baseline. Core item checkboxes do have a
44×44 wrapping label and were operable.

### P2 — local thumbnail attachment is absent at 390 px

The desktop local-thumbnail flow works and matched `card.png` to its row as a
blob URL. At `max-width: 760px`, however, the only **Add thumbnails** file
control is hidden with no mobile replacement. Mobile users cannot complete the
advertised local-thumbnail part of the workflow.

## Evidence collected

### Clean checkout, install, tests, and production build

- The worktree began clean at exactly
  `de9d8c0162004440e160ddd7dd3b5b636ae0976d`; `origin/main` resolved to the
  same commit before reporting.
- `npm ci`: passed, 61 packages installed, 0 vulnerabilities.
- `npm test`: passed — 2 Vitest tests and 7 Chromium Playwright tests.
- `npm run build`: passed — TypeScript `--noEmit` plus the exact Vite
  production build; `dist/index.html` was produced. No separate lint script is
  defined in `package.json`.
- Fresh production sizes: JS 32,376 bytes / 11,140 gzip; CSS 18,349 bytes /
  5,110 gzip; no font payload; 390 px AVIF hero 18,331 bytes and WebP fallback
  33,618 bytes. All are within the stated budgets.

### Independent product workflow

- Imported a BOM-prefixed catalog with arbitrary headings, quoted commas,
  escaped quotes, and a multiline cell; mapped ID/title/image/tags/location/
  condition/collection.
- Filtered to two Archive rows, added and deduplicated tags, cleared one
  condition, and downloaded exact patch and undo CSVs. Both retained `0007`
  and `08`, included rectangular unchanged values, and restored the original
  tag and condition values in undo. Undoing both batches disabled export.
- Confirmed local thumbnail matching by filename and that remote image hosts
  receive zero requests before opt-in and exactly one after opt-in.
- Recovery guidance was exercised for empty, headings-only, one-column,
  duplicate-heading, unclosed-quote, blank-ID, duplicate-ID, over-15 MB,
  empty-stage-value, and no-selection cases. Those cases passed apart from the
  spaces-only ID defect above.
- Free-mode catalog work left local storage empty. The live free workflow made
  zero third-party requests and set no JavaScript-visible cookies.

### Accessibility, keyboard, mobile, errors, and PWA

- `/opt/fleet/lib/verify-url.sh` passed locally and live: HTTP 200, title,
  `lang`, one `h1`, `main`, image alt, labeled buttons, and zero console/page
  errors. Recorded loads were 589 ms local and 761 ms live.
- Fresh axe runs found zero serious/critical findings on import, mapping, and
  workspace at both 1366×900 and 390×844 in the dark treatment, plus the
  mobile privacy and terms pages. Light-treatment checks also passed.
- The repaired mobile disclosure has accessible name **Desk Plus license
  options**. The mapping preview is keyboard-focusable. The skip link is first
  in the tab order with a visible 3 px outline and moves focus to `main`.
- At 390 px there was no horizontal overflow. Filter and ledger drawers moved
  focus inside, closed with Escape, and returned focus to their triggers.
- `prefers-reduced-motion: reduce` produced a computed transition duration of
  `1e-05s` and removed card hover movement.
- Service-worker registration/update succeeded; after a controlled offline
  transition the shell reloaded and showed its explicit offline status.
- Manual inspection of full-page desktop and 390 px import/workspace captures
  found no clipped primary content or obscured fixed controls.

### Deployment identity, policies, caches, and performance

- Live `index.html`, hashed JS, source map, CSS, all four illustration files,
  favicon, legal CSS, privacy, terms, robots, sitemap, and service worker each
  SHA-256 byte-matched the fresh `dist/` output. The deployment is the tested
  candidate, not a stale build.
- Live HTML and legal pages return 200 with 30-second revalidation. Hashed JS,
  CSS, and source map use `public, max-age=31536000, immutable`; `sw.js` uses
  `no-cache`. An unknown route returns 404.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, and CSP limiting scripts/styles to self,
  framing to none, and connections to self plus the two documented Sociobot
  API origins.
- Fresh Lighthouse 12.8.2 mobile run against live: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT
  70 ms, CLS 0, Speed Index 0.9 s, TTI 1.4 s.

## Applicability

This is a static PWA, not a library, CLI, or backend; consumer packaging,
server concurrency, persistence-boundary, and health/build-identity checks are
not applicable. No product code or deployment was changed during verification.
