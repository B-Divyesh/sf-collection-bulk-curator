# Perfection loop polish 1

Release candidate `5c14d998ea7aab2703cb551c46d262713076e30e` was reviewed through
`3675b45470a49b623c0122ac7ae1c2b569ed845a`. The repository contains no
earlier `review-*.md` or `polish-*.md` finding set. Every finding in
`review-1.md` is resolved below.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — route changes focused `main` instead of the current h1 | Added `tabindex="-1"` to every app h1. Demo entry, Reset demo, Start for real, CSV import, column mapping, back-to-import, new catalog, saved-session restore, and browser Back/Forward now render with focus on `#page-title`. | Playwright: `focuses the current h1 after demo history and screen changes`; full suite: 48/48 browser tests. Production cold audit records `true` for enter demo, Back, Forward, reset, and exit in [`live-audit.json`](./qa-artifacts/polish-1-live/live-audit.json). Screenshot: [`demo-mobile.png`](./qa-artifacts/polish-1-live/demo-mobile.png). Live: <https://collection-bulk-curator.sociobot.in/?demo=1>. |
| F-1-2 — visitor-facing fieldwork metaphors | Replaced the header subtitle with “Review catalog changes before export,” changed the paid panel label to “One-time license,” removed the decorative coordinate label, changed the 15 MB recovery step to “Split the CSV into smaller files,” and made the footer provenance literal. Expanded the copy audit to cover header, demo, license, footer, landing, workflow, and recovery copy. | Playwright: `uses literal task copy in the header, license panel, artwork, and CSV size recovery`; source scan `rg -i 'fieldwork\|field kit\|N 38' src public README.md` returned no matches. Production subtitle and same-origin request evidence are in [`live-audit.json`](./qa-artifacts/polish-1-live/live-audit.json). Desktop first screen: [`screenshot-desktop.png`](./qa-artifacts/polish-1-live/screenshot-desktop.png). Live: <https://collection-bulk-curator.sociobot.in/>. |
| F-1-3 — README sentence exceeded 22 words | Split the storage sentence into four sentences of 6, 10, 6, and 8 words. | [`copy-audit.md`](./copy-audit.md) records the counts. `README.md` contains the four replacement sentences and no 23-word original sentence. |

## Strict acceptance evidence

- `npm test`: 7/7 Vitest tests and 48/48 Playwright tests passed. Playwright
  runs serially by default so the full browser matrix is stable in constrained
  build workers.
- Fresh clone at committed repair `aa0517b955fd632bc86ef9443f99c230958eb8bf`:
  `npm ci` passed, all 20 exact commands from `.factory/claims.json` passed,
  and `npm run build` passed. Per-claim results are in
  [`claims-status.tsv`](./qa-artifacts/polish-1-live/claims-status.tsv).
- The same 20/20 claim sweep and build passed again from a fresh clone of the
  pushed evidence commit `93abc2f079f8a6ddd0e616691a07bbf2241339b4`.
- Build output: `dist/index.html`; initial JavaScript 39.08 kB raw / 12.83 kB
  gzip and CSS 21.26 kB raw / 5.52 kB gzip.
- `/opt/fleet/lib/verify-url.sh` passed production with title, `lang="en"`, one
  h1, main landmark, complete image alt text, labeled buttons, and no console
  errors. Report: [`verify.json`](./qa-artifacts/polish-1-live/verify.json).
- Production Axe checks found zero serious or critical issues on landing, demo,
  Privacy, Terms, and the designed 404.
- Production mobile Lighthouse: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.36 s, CLS 0, TBT 0. Report:
  [`lighthouse-mobile.json`](./qa-artifacts/polish-1-live/lighthouse-mobile.json).
- Production cold checks returned 200 for `/`, `/?demo=1`, `/privacy/`, and
  `/terms/`. `/missing-polish-check` returned the designed 404 with its own
  title, h1, and route home.
- The 390 × 844 landing had no horizontal overflow and kept the demo action in
  the first screen. Production mobile capture:
  [`screenshot-mobile.png`](./qa-artifacts/polish-1-live/screenshot-mobile.png).
- A dedicated production browser context reloaded `/?demo=1` offline under
  service-worker control with the demo banner and offline status visible. It
  produced no console errors. Evidence:
  [`offline-audit.json`](./qa-artifacts/polish-1-live/offline-audit.json).
- A seeded real-session sentinel survived demo entry, reset, and exit. Demo
  storage was removed on exit. All observed landing and demo requests were
  same-origin.

## Deployment

- Resource: `sf-collection-bulk-curator` in resource group `sociobot`.
- Production deployment ID: `419ad37c-a0e3-49f9-a26b-e1e6d292153f`.
- Custom domain: <https://collection-bulk-curator.sociobot.in>.
- Deployed repair commit: `aa0517b955fd632bc86ef9443f99c230958eb8bf`.

No finding remains open.
