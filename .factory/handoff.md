# Collection Batch Desk — repair handoff

## Status: deployed and verified

This repair resolves the independent verifier's P1 from candidate
`49724c9cb569ecc0204e6b13af39c0c62a1ff2a9`: a returning PWA client could
remain on the prior defective JavaScript because both releases served the
byte-identical service worker and `collection-batch-desk-v3` cache.

Repair commit: `4fc5e7acd7cdae1e3b6164e2e378d8e5cf4dd4a0`
(`fix: refresh PWA cache on each release`).

## What changed

- `scripts/generate-sw.mjs` fingerprints the full emitted artifact and the
  release identifier (CI SHA when available, otherwise Git `HEAD`) and writes
  the production `dist/sw.js` after Vite builds.
- `public/sw.js` is now a source template. Each production build receives a
  distinct `collection-batch-desk-r<release>-<artifact>` cache name. It keeps
  `skipWaiting`, claims clients on activation, and removes all earlier cache
  namespaces.
- The build command runs the generator after TypeScript and Vite:
  `tsc --noEmit && vite build && node scripts/generate-sw.mjs dist`.
- `@regression:pwa-upgrade` is an exact browser regression. Its legacy
  service-worker fixture has SHA-256
  `5d143fad46a371a15ffffc6a2c407381820928d45cb705456e818d9b80d16618`,
  the exact failed worker from `fc291527…` / `49724c9…`. In a separate
  persistent context it installs that `v3` worker, switches the same origin
  to the current build, calls `registration.update()`, waits for old-cache
  deletion, and proves that both online and offline reloads use the new shell.

## Reproduction and repair evidence

Before the code change, a persistent profile controlled by the preceding
artifact loaded `/assets/index-ULxunsl-.js` from
`collection-batch-desk-v3`. After the server root switched to the verifier
candidate, a direct network fetch named `/assets/index-C_bR1aIn.js`, but both
an online update/reload and offline reload still loaded `index-ULxunsl-.js`.
This reproduces verification-4 exactly.

After the repair, the same old-build-to-new-build profile upgraded from the
legacy SHA above to `collection-batch-desk-r4fc5e7acd7cd-fde079e70a41`.
The `v3` cache was gone before reload; online and offline reloads both loaded
`/assets/index-C_bR1aIn.js`, with no browser console or page errors.

## Verification run locally

- Clean install: `npm ci` — 61 packages, 0 install vulnerabilities.
- Dependency audit: `npm audit --omit=dev` — 0 vulnerabilities.
- Unit and browser suite: `npm test` — 6 Vitest tests and 21 Chromium
  Playwright tests passed (38.4 s). This includes desktop and 390 px mobile,
  keyboard focus, reduced motion, accessibility scans, privacy/billing flows,
  local thumbnails, selection-scope safety, undo/export bytes, offline shell,
  and the persistent PWA-upgrade regression.
- Type check and production build: `npm run build` passed and emitted `dist/`.
  There is no separate lint configuration; `tsc --noEmit` is the repository's
  type check and is part of every production build.
- URL smoke check against fresh `dist/` passed through
  `/opt/fleet/lib/verify-url.sh`: title present, `lang=en`, exactly one `h1`,
  `main`, complete image alt coverage, labeled buttons, and no console/page
  errors. Playwright Axe scans in the test suite found zero serious or
  critical violations across import, workspace, 390 px states, privacy, and
  terms.
- Privacy capture across the sample import/review workflow observed 19
  requests, all to `http://127.0.0.1:4174`; no third-party request occurred.
- Response policy inspection confirms immutable `/assets/*` caching,
  `sw.js: no-cache`, CSP `frame-ancestors 'none'`, self-only scripts, and the
  two documented Sociobot API connection origins.
- Lighthouse 12.8.2 against the local production preview: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 1,009 ms, LCP 1,510
  ms, TBT 0 ms, CLS 0.
- Production output: JS 35,002 B (11,867 B gzip), CSS 18,790 B (5,184 B
  gzip), mobile AVIF 18,331 B, total `dist/` 403,247 B. All static budgets
  pass.

## Deployment and known gaps

The artifact class remains Vite + vanilla TypeScript static web, built to
`dist/` for Azure Static Web Apps. The verified artifact was deployed to the
production Static Web App `sf-collection-bulk-curator` and its custom domain
<https://collection-bulk-curator.sociobot.in>.

Live checks after deployment passed: the root, worker, JS, CSS, and legal
pages byte-match fresh `dist/`; assets are immutable, `sw.js` is `no-cache`,
the CSP/security headers are present, and an unknown route returns 404. A
fresh live PWA context is controlled by a `collection-batch-desk-r…` cache,
not `v3`; its offline reload shows the product shell and has zero errors.

No product gaps are known. The standalone Axe CLI could not start its own
Selenium Chrome in this worker image, so the successful pinned Playwright
`@axe-core/playwright` coverage is the accessibility evidence used here.
