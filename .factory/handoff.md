# Collection Batch Desk — polish 1 handoff

## Status: PASS

Release 1.0.2 resolves all three findings in `.factory/review-1.md`. Route and
screen changes focus the current h1, visitor copy now names literal catalog
tasks, and the README storage explanation is split into short sentences. The
one-click `?demo=1` workspace remains isolated, resettable, and offline-ready.
The product-specific survey-desk visual system is preserved.

The catalog description is now: “Stage bulk catalog edits, review a chosen
subset, and export patch and undo CSV files.” It begins with a verb and is 86
characters.

## Verification

- `npm ci`
- `npm test` — 7 unit tests and 48 browser tests passed. The checked-in
  Playwright configuration runs this browser matrix serially.
- Each of the 20 exact claim commands from `.factory/claims.json` — 20/20 passed
  from a fresh clone of `aa0517b955fd632bc86ef9443f99c230958eb8bf`.
- `npm run build` — passed; `dist/` contains `index.html`.
- Initial JavaScript: 39.08 kB raw / 12.83 kB gzip.
- CSS: 21.26 kB raw / 5.52 kB gzip.
- Production `verify-url.sh` — passed with no console errors.
- Production Axe — zero serious or critical findings on landing, demo,
  Privacy, Terms, and 404.
- Production mobile Lighthouse — 100 Performance, 100 Accessibility,
  100 Best Practices, 100 SEO; LCP 1.36 s, CLS 0, TBT 0.
- Production dedicated-context offline demo reload — passed with no console
  errors.
- Production cold focus checks — h1 focused after demo entry, browser Back,
  browser Forward, Reset demo, and Start for real.
- Production privacy check — same-origin requests only; the real-session
  sentinel survived demo entry, reset, and exit.
- Production route checks — landing, demo, Privacy, and Terms returned 200;
  an unknown route returned the designed 404.

Detailed finding-to-evidence mapping is in [`polish-1.md`](./polish-1.md).
Browser, Lighthouse, claim, and offline artifacts are under
[`qa-artifacts/polish-1-live/`](./qa-artifacts/polish-1-live/).

## Deployment

The repair was pushed to `main` and deployed through the work-order static
deployment flow to <https://collection-bulk-curator.sociobot.in>. Azure
deployment `419ad37c-a0e3-49f9-a26b-e1e6d292153f` succeeded on the authorized
resource `sf-collection-bulk-curator`.

## Known gaps and next steps

None. No review finding or required acceptance check remains unresolved.
