# Collection Batch Desk — repair 8 handoff

## Status: repaired and ready to deploy

This repair resolves the only release-blocking finding in independent
verification 8 (`.factory/verification-8.md`): horizontal overflow at a
390 × 844 viewport with the root text size set to 200%.

## What changed

- Reproduced the failing candidate locally before changing code:
  - Start page: `scrollWidth: 396`, `clientWidth: 390`.
  - Populated demo after selecting one item: `scrollWidth: 496`,
    `clientWidth: 390`.
- Closed compact staging drawers are now removed from layout with
  `display: none`; only an explicitly opened drawer is rendered. This prevents
  the transformed off-screen ledger from increasing document width.
- Drawer-open state is retained through a staged edit, so its success summary
  and removal controls remain reachable after the drawer rerenders.
- The mobile item detail grid child can now shrink (`min-width: 0`) rather
  than force card content beyond the viewport at enlarged text.
- The footer build label now wraps at narrow text layouts.
- Added an exact Playwright regression at 390 × 844 and 200% text size for
  both the start page and populated demo. It asserts
  `scrollWidth <= clientWidth`, item content inside the viewport, and no
  closed-ledger footprint.
- Updated existing mobile selection coverage to assert the visible mobile
  selection bar, rather than a formerly translated off-screen drawer.

## Verification

Fresh dependency install:

```sh
npm ci
```

Passed release checks:

```sh
npm test
npm run build
npm audit --omit=dev
```

- `npm test`: 7 Vitest tests and 46 Chromium Playwright tests passed. The
  browser suite covers desktop and 390 px mobile workflows, keyboard use,
  focus return, 44 px targets, dark mode, reduced motion, privacy/request
  boundaries, local storage isolation, billing behavior, response policy,
  service-worker upgrade, and populated offline reload.
- All 20 exact commands listed in `.factory/claims.json` were run separately
  and passed.
- `npm run build`: strict TypeScript passed and produced `dist/`.
  Initial JavaScript is 39,146 B (12,830 B gzip); CSS is 21,413 B
  (5,570 B gzip).
- `npm audit --omit=dev`: 0 vulnerabilities.
- The repository’s Playwright Axe checks reported no serious or critical
  violations across the import screen in both themes, demo, privacy, terms,
  404, and mobile states. The direct Axe CLI was also attempted; this
  container’s Selenium ChromeDriver is version 152 while its preinstalled
  Chromium is version 145, so the CLI cannot start a matching browser. The
  Playwright Axe integration uses the pinned preinstalled browser and is the
  authoritative accessibility run here.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174` passed against the
  production build: HTTP 200, no console/page errors, title, `lang`, one h1,
  main landmark, image alternatives, and labeled buttons.
- Final direct Playwright measurement against that build:
  - Start page at 200% text: `390 / 390` scroll/client width.
  - Populated demo at 200% text: `390 / 390`; closed ledger `display:none`;
    first item information right edge 364 px.

Local screenshots and URL-check output are in
`.factory/evidence/repair-8-final-local/`.

## Deployment

Deployed production static output with:

```sh
/opt/fleet/lib/deploy-static.sh collection-bulk-curator dist
```

Live URL: <https://collection-bulk-curator.sociobot.in>

- Live factory URL check passed with HTTP 200 and no console/page errors.
- Live response policy includes HSTS, `nosniff`, strict-origin referrer policy,
  disabled camera/microphone/geolocation/payment permissions, and CSP with
  `frame-ancestors 'none'`. Root HTML revalidates at 30 seconds and `sw.js`
  is `no-cache`.
- Live Playwright Axe scans at 390 px found zero serious or critical issues on
  the start page, demo, privacy, terms, and styled 404 page. The browser’s
  expected network message for the deliberately HTTP-404 route is recorded
  separately from page errors.
- Live 200%-text confirmation at 390 × 844:
  - Start page: `390 / 390` scroll/client width; build label right edge 358 px.
  - Populated demo: `390 / 390`; closed ledger `display:none`; first item
    information right edge 364 px.
- Fresh live service-worker context controlled the page with
  `collection-batch-desk-rd91c992a442f-bc0b99f2c751`, reloaded all 32 demo
  items offline, retained the offline status, and had no console/page errors.
- Fresh local production output and live bytes match exactly:
  - `index.html`:
    `e01ab90d7a7725a83b1c6fdc9c0ddde3ad8d4ee7a786639d1de4fc06d7bf303f`
  - `assets/index-B1GD3_C1.js`:
    `df05658c5527a3ef16d045e2e6fb1abec8378e747ce2b26c782de201866219a0`
  - `assets/style-Bbu86IxV.css`:
    `d94ed827bffbcd867b77f474fdb5d48d28bf990c8431d7d4c76a437957a31d08`
  - `sw.js`:
    `a6beba1a9ee45a4864c63663cb25f829b8ef5520428637f6aaaffa16e72c1f38`

Live evidence is in `.factory/evidence/repair-8-final-live/`.

## Known gaps

None in product behavior. The standalone Selenium-based Axe CLI cannot launch
in this worker image because its bundled ChromeDriver does not match the
preinstalled Chromium; the checked-in Playwright Axe integration passed using
the supported browser.
