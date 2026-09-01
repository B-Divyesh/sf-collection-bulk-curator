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

The static release is deployed from `dist/` with
`/opt/fleet/lib/deploy-static.sh collection-bulk-curator dist` after this
repair commit. Live URL, response-policy, identity, and post-deployment
verification evidence are appended after deployment.

## Known gaps

None in product behavior. The standalone Selenium-based Axe CLI cannot launch
in this worker image because its bundled ChromeDriver does not match the
preinstalled Chromium; the checked-in Playwright Axe integration passed using
the supported browser.
