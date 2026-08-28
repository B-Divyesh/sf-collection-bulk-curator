# Collection Batch Desk — repair handoff

## Verdict: repaired and deployed

Work order `collection-bulk-curator-repair-2` repairs every finding in the
independent verifier report at `b70223c411284c8a6553841d2c99a3d11ccc2f25`
for candidate `de9d8c0162004440e160ddd7dd3b5b636ae0976d`. The artifact remains a
Vite + TypeScript static PWA deployed from `dist/` to Azure Static Web Apps at
<https://collection-bulk-curator.sociobot.in/>.

## Repairs

- Repeated semantic column mappings are rejected before the workspace opens.
  The exact `ID` + Tags→`ID` reproduction now reports that `ID` is mapped to
  both Item ID and Tags. Export construction independently rejects duplicate
  output headings, protecting restored/legacy state as well as new imports.
- Whitespace-only identifiers are counted as blank. Valid nonblank identifier
  bytes are never trimmed; exact patch and undo regression assertions retain
  `0007` verbatim.
- Mobile brand, footer legal/source links, and legal-page return links measure
  at least 44×44 CSS px. The 390px workspace keeps **Add thumbnails** visible,
  and a real PNG matched by filename renders from a local blob URL.
- Release builds now default to
  `https://api.sociobot.in/api/v1`; pilot is an explicit staging override only.
  A live Dodo one-time product, **Collection Batch Desk Plus**, was created at
  $19 USD and registered as enabled for `collection-bulk-curator`, production
  mode, with the product URL as its return URL.
- While checking the required offline/update path, an additional cache flaw was
  found: responsive AVIF requests could miss cache entries with a differing
  `Vary: Origin` request. Cache v3 now precaches every responsive illustration
  and favicon and matches same-origin cached assets while ignoring `Vary`.
  Offline reload is covered with a zero-console-error regression.

The researched brief, visual thesis, local-first privacy boundary, free core,
reversible staging, remote-image opt-in, and all previously passing behavior
are preserved.

## Regression coverage

`src/catalog.test.ts` covers mapping conflicts, whitespace-only IDs, byte
preservation, exact forward/undo tables, and the export-level duplicate-heading
fail-safe. `tests/e2e/app.spec.ts` covers the verifier's exact corrupting CSV,
exact BOM/CRLF patch and undo bytes, production checkout URL, returned-license
capture/URL stripping/daily cache/revocation, 390px target sizes, mobile local
thumbnail rendering, axe scans, keyboard drawers, and clean service-worker
update/offline reload.

## Local verification — 2026-08-28 UTC

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/ <evidence-dir>
```

- `npm ci`: 61 packages installed, 0 vulnerabilities.
- `npm test`: 6 Vitest unit tests and 14 Playwright Chromium tests passed.
- `npm run build`: TypeScript `--noEmit` and Vite build passed; `dist/index.html`
  is present. This minimal project has no separate lint rules; the strict
  TypeScript build is its static-analysis gate.
- Production output: JS 33,250 bytes / 11.46 KB gzip; CSS 18,547 bytes / 5.14
  KB gzip; no font payload; mobile AVIF 18,331 bytes. All budgets pass.
- Local `verify-url.sh`: HTTP 200 in 529 ms; title, `lang=en`, one `h1`, `main`,
  image alt text, labeled buttons, and zero console/page errors passed.
- Desktop 1366×900 and mobile 390×844 browser checks passed with zero horizontal
  overflow or third-party requests in the free workflow. The skip link is the
  first keyboard stop with a 3px outline and moves focus to `main`; Escape
  returns focus from the mobile filter drawer. Light/dark app states and both
  legal pages have zero serious/critical axe findings. Reduced motion computes
  to `1e-05s` and removes card movement.
- Service-worker registration/update and a controlled offline reload passed;
  the full app rendered its explicit offline status with no failed resources,
  console errors, or page errors.
- Lighthouse 12.8.2 mobile production preview: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.5 s,
  TBT 0 ms, CLS 0, Speed Index 0.9 s.

## Deployment and live verification

Repair commits `0f25926` and `757513e` were pushed to `main`. `dist/` was
deployed with `/opt/fleet/lib/deploy-static.sh collection-bulk-curator dist`;
Azure deployment `8840c80f-1b48-44d0-8b52-67863266c42f` succeeded.

- Live `verify-url.sh`: HTTP 200 in 833 ms with zero console/page errors and all
  structural checks passing.
- Live `index.html`, hashed JS, source map, CSS, service worker, legal pages,
  legal CSS, favicon, robots, sitemap, and all four illustration files SHA-256
  byte-match `dist/`. (`staticwebapp.config.json` is consumed by Azure and is
  not exposed as a public artifact.)
- Live app and legal HTML use 30-second revalidation; hashed JS/CSS use
  one-year immutable caching; `sw.js` uses `no-cache`; unknown routes return
  404. HSTS, CSP, `nosniff`, strict-origin referrer policy, and the restrictive
  permissions policy are present.
- The production checkout endpoint returns HTTP 303 to
  `checkout.dodopayments.com`; the hosted page returns 200 and displays
  **Collection Batch Desk Plus** and **$19.00**. The public verify endpoint
  returns the documented `{valid:false, reason:"invalid"}` contract and permits
  the product origin through CORS.
- A live returned-token probe stored the token under
  `sb_license:collection-bulk-curator`, stripped only `license` while retaining
  the other query parameter and hash, called the production verifier (HTTP
  200), remained safely locked for an invalid token, and displayed recovery
  guidance. Mocked-browser coverage proves valid unlock, daily caching, and
  later revocation. No real charge was submitted during verification.
- Live desktop reproduced the full import/map/stage/export path and exact CSV
  bytes with zero errors or third-party free-mode requests. Live 390px checks
  passed touch targets, thumbnail attachment, focus return, no overflow,
  reduced motion, app/legal axe, and clean controlled offline reload.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 20 ms, CLS 0, Speed Index 0.9 s.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh collection-bulk-curator dist
```

## Known boundaries

- Desk Plus deliberately does not persist local thumbnail blobs; a restored
  workspace asks the user to reattach images.
- Applying the platform-neutral patch remains a reviewed manual step; direct
  third-party catalog automation is outside the researched brief.
- This is a static web product, so package-consumer, server concurrency,
  persistence-boundary, and backend health/build-identity gates do not apply.
