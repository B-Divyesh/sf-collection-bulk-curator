# Collection Batch Desk — repair handoff

## Release blocker repaired

This repair addresses the independent verifier report recorded at commit
`aa0f0ea0a74914d7940152e10ee502e1e88c9006` for candidate
`1965d33d9a4f9e247cee65cddb2698affc46051e`.

- At 390 px, the compact Desk Plus `<summary>` now has the persistent
  accessible name **“Desk Plus license options”**. It no longer depends on
  the visible `Desk Plus` span, which the mobile layout intentionally hides.
- The new regression test asserts that exact accessible name on import,
  mapping, and workspace at 390 x 844, then runs axe in all of those states
  in the dark treatment. It also runs axe at that width for `/privacy/` and
  `/terms/`.
- The expanded mobile axe sweep found one additional serious issue in the
  mapping screen: its horizontally scrollable source-preview table could not
  receive keyboard focus. The scroll region is now a labeled, focusable
  region (`tabindex="0"`), with a direct focus regression assertion.

The researched brief, local-first workflow, CSV/export semantics, Plus
boundary, visual system, and all previously passing behavior are preserved.

## Verification performed locally (2026-08-28 UTC)

```sh
npm ci
npm test
npm run build
```

- Clean `npm ci` completed with 0 vulnerabilities.
- `npm test` passed: 2 Vitest CSV tests and 7 Chromium end-to-end tests.
  Coverage includes import/mapping/review/stage/export/undo, malformed and
  duplicate-ID safety, desktop axe, 390 px axe on import/mapping/workspace in
  dark theme, 390 px legal-page axe, and mobile filter/ledger reachability.
- `npm run build` passed TypeScript `--noEmit` and Vite. `dist/index.html` is
  present. There is no separate lint script in this deliberately minimal
  TypeScript/Vite project; the build performs its type check.
- Production output: JavaScript 32,376 bytes (11,140 gzip) and CSS 18,349
  bytes (5,110 gzip), within the static-product budgets.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/` passed: HTTP 200,
  528 ms local load, no console/page errors, title/lang/main/one h1 present,
  and no missing image alt or unlabeled buttons.
- A Chromium keyboard/mobile/offline smoke test passed: skip-link focus,
  Enter operation of Desk Plus, 390 px source-preview focus, dark theme,
  Escape closes the filter drawer and returns its focus, and the service
  worker serves a first-visit app-shell reload offline.
- Privacy policy review confirmed no analytics, remote fonts, or third-party
  runtime scripts. Free catalog data is not persisted; only theme, optional
  license/verdict, and licensed workspace recovery use local storage. Remote
  thumbnails remain opt-in. `public/staticwebapp.config.json` keeps the CSP,
  nosniff, referrer, permissions, immutable-asset, and no-cache service-worker
  policies used by the prior verified release.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh collection-bulk-curator dist
```

Deployment target remains Azure Static Web Apps, with `dist/` as its static
root and `dist/index.html` at that root.

## Deployment and live verification (2026-08-28 UTC)

- Deployed the repaired `dist/` with
  `/opt/fleet/lib/deploy-static.sh collection-bulk-curator dist`. Azure Static
  Web Apps deployment `cdf1d939-0489-4be1-8f30-ce74e6675e4f` completed, and
  `https://collection-bulk-curator.sociobot.in/` returned HTTPS 200.
- Live `/opt/fleet/lib/verify-url.sh` passed in 733 ms with no console/page
  errors, title/lang/main/one h1, zero missing image alts, and zero unlabeled
  buttons.
- Live `/index.html`, `/assets/index-CE92pazD.js`, the stylesheet, `/sw.js`,
  `/privacy/index.html`, and `/terms/index.html` SHA-256 byte-match `dist/`.
  The JS asset has one-year immutable caching, `sw.js` has `no-cache`, and the
  document has 30-second revalidation.
- Live response headers include CSP, HSTS, nosniff, strict-origin referrer
  policy, and the restrictive permissions policy. A fresh browser session
  made zero third-party requests through import and free workspace; free-mode
  local storage remained empty.
- Fresh live axe at 390 x 844 reports zero serious/critical findings on
  import, dark mapping, dark workspace, privacy, and terms. The Desk Plus
  summary name was explicitly confirmed as “Desk Plus license options”.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 0 ms, CLS 0.

## Known gaps and next steps

- Plus workspace recovery intentionally does not persist local image blobs;
  users reattach thumbnail files after restoring a session. This avoids hidden
  duplication of personal images in browser storage.
- The product exports platform-neutral CSV patches; applying them remains a
  reviewed manual step because direct account automation is out of scope.
- Validate the factory-registered test checkout and return URL after product
  registration; the UI and verify/cache/restore-token paths are implemented,
  but no product is registered from this repository.
