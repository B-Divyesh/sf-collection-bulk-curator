# Collection Batch Desk — polish 2 handoff

## Status: PASS

Repair commit: `5087b01597fbd2217d0155ae79aa92e3f33508b9` (pushed to `main`).
Production deployment: `4658d542-c734-4903-a04d-8c0beb526b65`.
Live product: <https://collection-bulk-curator.sociobot.in/>.

## What changed

- Removed untestable broad safety/security wording. The landing headline now
  names the job: `Stage bulk catalog edits before export`.
- Updated landing/runtime/OG/Twitter metadata and README to use the same plain
  wording and the consistent `undo CSV` term.
- Removed `Secure checkout`; payment copy now only identifies Sociobot and
  Dodo.
- Renamed the undo-export announcement to `Undo CSV` and added a browser
  regression for that announcement.
- Marked GitHub source links external on the app, Privacy, Terms, and 404
  routes. Footer links now wrap at 200% text size on a 390 px screen.
- Updated the catalog description and copy audit.

## Verification

- `npm test`: PASS — 7 unit tests and 48 browser tests.
- `npm run build`: PASS — produced `dist/`; JS 12,681 B gzip and CSS 5,516 B
  gzip.
- Fresh clone: `npm ci`, all 20 exact `.factory/claims.json` commands, and
  `npm run build`: PASS.
- Local and production `/opt/fleet/lib/verify-url.sh`: PASS. Production report
  and screenshots: [verify.json](./qa-artifacts/polish-2-live/verify.json),
  [desktop](./qa-artifacts/polish-2-live/screenshot-desktop.png), and
  [mobile](./qa-artifacts/polish-2-live/screenshot-mobile.png).
- Production cold recheck: `/?demo=1` opened its isolated 32-item desk with
  banner/reset/exit; staged undo export announced `Undo CSV`; zero console
  errors; mobile width stayed 390 px. Details: [live audit](./qa-artifacts/polish-2-live/live-audit.md).

## Run and deploy

```sh
npm ci
npm test
npm run build
```

Deploy `dist/` through the Static Web App work-order configuration for
`sf-collection-bulk-curator`.

## Known gaps

None.
