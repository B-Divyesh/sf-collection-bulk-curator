# Independent verification — FAIL

**Work order:** `collection-bulk-curator-verify-1`  
**Candidate:** `1965d33d9a4f9e247cee65cddb2698affc46051e` (`main`)  
**Live URL:** https://collection-bulk-curator.sociobot.in  
**Verified:** 2026-08-28 UTC

## Release verdict

**FAIL — release-blocking accessibility defect.** The required 390 px mobile
layout hides the only text inside the Desk Plus `<summary>`. Its lock icon is
`aria-hidden`, so the remaining keyboard-focusable disclosure has no
discernible accessible name. Axe reports `summary-name` at **serious** impact
on both the initial import screen and the review workspace. This breaches the
acceptance contract's keyboard/screen-reader baseline and the explicit
requirement for zero serious/critical axe findings.

### P1 — unnamed Desk Plus disclosure on mobile

- **Reproduction:** open the live URL in Chromium at 390 x 844, then run
  `new AxeBuilder({ page }).analyze()` from `@axe-core/playwright` 4.10.2.
- **Result:** `summary-name` / serious, target `summary`:
  `<summary><svg aria-hidden="true" ...></svg> <span>Desk Plus</span></summary>`.
- **Cause demonstrated by the candidate CSS:** at `max-width: 760px`,
  `.license-menu summary span { display: none; }`. The SVG is deliberately
  hidden from assistive technology, leaving no accessible text or aria label.
- **Observed states:** import and sample-catalog workspace; local production
  build and hash-identical deployment.

## Evidence collected

### Reproducibility and deploy identity

- Clean checkout was already exactly the candidate and had no working-tree
  changes before verification.
- `npm ci` completed with 0 vulnerabilities.
- Exact build command `npm run build` passed and produced `dist/`.
- The live copies of `index.html`, `assets/index-DLWPNq4w.js`,
  `assets/style-_TtZtoHC.css`, `sw.js`, `privacy/index.html`, and
  `terms/index.html` each SHA-256 matched fresh `dist/` byte-for-byte.

### Automated checks

- `npm test`: **PASS** — 2 Vitest unit tests plus 5 Playwright tests.
- `npm run build`: **PASS** — TypeScript no-emit check and Vite production
  build. No separate lint script is defined in `package.json`.
- Independent axe at desktop: no serious/critical findings observed. At
  390 px: **FAIL** with the P1 `summary-name` finding above.
- Fresh Lighthouse mobile run against live deployment: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.5 s,
  TBT 39 ms, CLS 0. (Lighthouse did not surface the mobile summary-name rule;
  direct axe is the governing accessibility check.)

### Product workflow and boundary coverage

- **PASS:** imported a representative quoted CSV with arbitrary headings;
  mapped columns; filtered Archive to two records; staged tag-add and
  condition-clear changes; exported patch and undo CSVs; verified the exports
  retained `0007` and `08` exactly and contained correct forward/original
  values; undid both batches back to no staged export.
- **PASS:** malformed unclosed quote produced recovery guidance; blank IDs
  were rejected; repository tests additionally cover duplicate IDs.
- **PASS:** free workspace did not place catalog/session data in localStorage.
  Remote image URLs produced no request by default and were requested only
  after explicit opt-in.
- **PASS:** skip link focused first, had a visible 3 px focus outline, and
  moved focus to `main`; mobile filter and ledger drawers returned focus to
  their triggers on Escape; 390 px had no horizontal overflow.
- **PASS:** reduced-motion media query reduced transition duration to 0.01 ms
  equivalent (`1e-05s` computed); service worker activated and a first-visit
  offline reload of the app shell succeeded. Registration/update invocation
  completed without a browser error.
- **PASS:** no console or page errors in independent local and live Chromium
  sessions. No initial third-party runtime request was observed.

### Privacy, response policies, caches, and budgets

- **PASS:** no analytics, remote fonts, or third-party initial requests; CSV
  data remained client-side in the free tier. CSP permits only self scripts,
  self styles, self/blob/data/https images, and the two documented Sociobot
  API origins for connections. `X-Content-Type-Options`, strict-origin
  referrer policy, HSTS, clickjacking protection via `frame-ancestors 'none'`,
  and a restrictive permissions policy were present live.
- **PASS:** live hashed JS and CSS returned
  `cache-control: public, max-age=31536000, immutable`; `sw.js` returned
  `no-cache`; HTML and legal documents returned 200 with 30-second
  revalidation.
- **PASS:** fresh build sizes: JS 32,279 bytes / 11,067 gzip (under 200 KB),
  CSS 18,349 bytes / 5,111 gzip (under 50 KB), no fonts; mobile AVIF 18,331
  bytes and mobile WebP 33,618 bytes (under 300 KB).

## Required remediation

Give the mobile Desk Plus summary a stable accessible name that remains when
its visible label is hidden (for example an `aria-label`), then re-run axe at
390 px on import, mapping, workspace, dark theme, privacy, and terms before
re-submitting. Do not rely solely on Lighthouse's aggregate accessibility
score for this check.
