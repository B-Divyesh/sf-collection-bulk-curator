# Collection Batch Desk — repair 5 handoff

## Status: release repair verified locally

This repair resolves both release blockers in independent verification 5 for
candidate `f0ddcc8513082ce03d32264bda57d7c5cc5e39bd`.

1. `.factory/claims.json` now lists every published, visitor-reliant product
   claim with exactly one tagged browser test. `src/claims.test.ts` prevents a
   missing manifest, duplicate ID, wrong command, or duplicate/missing test tag
   from passing CI.
2. `/?demo=1` now opens the 32-item catalog directly in the review desk. The
   first screen says **Try it with sample data**, names collectors, and has the
   required plain-language privacy, offline, and price facts. Demo state lives
   only under `demo:collection-bulk-curator:session`; it never reads or writes
   `collection-bulk-curator:session`. The persistent banner provides **Reset
   demo** and **Start for real**.

The product remains a Vite + vanilla TypeScript static PWA. Its deployment
artifact is still `dist/` for Azure Static Web Apps.

## Regression coverage

- `@claim:local-data` captures the full demo edit flow and permits only
  same-origin requests; it also proves the real Desk Plus workspace is not
  written.
- `@claim:remote-thumbnails` proves the demo’s fixture image makes no request
  until the user enables remote thumbnails.
- `@claim:exact-ids`, `@claim:patch-csv`, and `@claim:undo-manifest` assert
  exact downloaded CSV bytes, including zero-padded ID `0001` and the original
  location value.
- `@claim:demo-isolation` seeds a real-workspace sentinel, enters, resets, and
  exits demo mode, then proves only the `demo:` namespace changed.
- `@claim:offline-reload` uses its own browser context, waits for service
  worker control, then reloads `/?demo=1` offline.
- `@claim:desk-plus-price` asserts the visible $19 one-time offer and the
  documented Sociobot checkout route.
- Desktop and 390 px Playwright Axe scans now cover import, dark import,
  mapping, sample workspace, dark sample workspace, privacy, and terms with
  zero serious or critical violations. The existing mobile keyboard, drawer,
  touch-target, focus, reduced-motion, PWA-upgrade, local-thumbnail, and
  reversible CSV tests remain passing.

## Verification evidence

- Clean install: `npm ci` completed with 61 packages and 0 vulnerabilities.
- Dependency audit: `npm audit --omit=dev` found 0 vulnerabilities.
- Unit + browser suite: `npm test` passed: 7 Vitest tests and 29 Chromium
  browser tests.
- Claims suite: `npm test -- --grep @claim:` passed all 8 claim tests.
- Type/build: `npm run build` passed (`tsc --noEmit`, Vite, and service-worker
  generation) and emitted `dist/`. There is no separate lint configuration;
  TypeScript checking is included in the production build.
- Built-artifact smoke test: `/opt/fleet/lib/verify-url.sh` against the local
  preview found `lang=en`, a title, one h1, main landmark, complete image alt
  coverage, labeled buttons, and no browser console/page errors. Output is in
  `.factory/evidence/repair-5/verify.json` with desktop/mobile screenshots.
- Local Lighthouse mobile-equivalent run: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 40 ms, CLS 0.
- Current output: JS 37,278 B / 12,227 B gzip; CSS 19,534 B / 5,304 B gzip;
  mobile AVIF 18,331 B and WebP 33,618 B. All static budgets pass.
- Response policy source check passed: Static Web Apps config retains immutable
  hashed assets, `sw.js: no-cache`, self-only scripts, restrictive connection
  origins, and `frame-ancestors 'none'` as a response header.

## Demo and docs

- Demo instructions and storage isolation: `.factory/demo.md`.
- Claim-to-test contract: `.factory/claims.json`.
- Plain-words audit and terminology table: `.factory/copy-audit.md`.
- README, privacy notice, and sitemap now describe the direct demo and its
  separately resettable browser state.

## Deployment

The deployment target is Azure Static Web App `sf-collection-bulk-curator` in
resource group `sociobot`, serving
`https://collection-bulk-curator.sociobot.in`. The final commit SHA and live
identity checks are recorded after the requested push and deployment.

## Known gaps

None known. The standalone Axe CLI is not used because its Selenium launcher
is unavailable in this worker image; the pinned `@axe-core/playwright` suite
provides the governing desktop and 390 px Axe evidence.
