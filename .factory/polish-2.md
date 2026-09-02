# Perfection loop polish 2

Repair commit: `5087b01597fbd2217d0155ae79aa92e3f33508b9`.
Production deployment: `4658d542-c734-4903-a04d-8c0beb526b65`.
Live URL: <https://collection-bulk-curator.sociobot.in/>.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — route changes focused `main` rather than the h1 | Retained the prior `#page-title` focus behavior and rechecked demo entry, Back, and Forward after this release. | Playwright `focuses the current h1 after demo history and screen changes`; live cold audit confirms `page-title` in all three states: [live audit](./qa-artifacts/polish-2-live/live-audit.md). |
| F-1-2 — fieldwork metaphors and decorative label | Retained the literal subtitle, `One-time license`, removed coordinate label, and literal CSV-size recovery. | Playwright `uses literal task copy in the header, license panel, artwork, and CSV size recovery`; [live desktop screenshot](./qa-artifacts/polish-2-live/screenshot-desktop.png). |
| F-1-3 — README sentence exceeded 22 words | Retained the split storage sentences; the revised opening is 6 then 20 words. | [copy audit](./copy-audit.md); `npm test` passed. |
| F-2-1 — unlisted `safely` claim | Replaced headline, landing title, runtime metadata, social metadata, and README opening with `Stage bulk catalog edits before export`; removed other visitor-facing broad safety wording. | Browser metadata regression `sets complete per-route metadata…`; [live verifier](./qa-artifacts/polish-2-live/verify.json) records the new title; live audit checks the title, h1, and description. |
| F-2-2 — untested `Secure checkout` claim | Removed the sentence. The disclosure now only names Sociobot and Dodo as payment handlers. | Live audit records the exact license-panel copy; `npm test` (48 browser tests) passed. |
| F-2-3 — undo file had two names | Replaced the remaining visitor-facing `Undo manifest` toast with `Undo CSV`; metadata now also uses `undo CSV`. Added a browser regression that asserts the undo export announcement. | Playwright `imports, stages, undoes, and exports a reversible batch`; live audit records the undo filename and `Undo CSV exported with 1 row.` |
| F-2-4 — GitHub link was not identified as external | Changed the app, Privacy, Terms, and 404 footers to visible `Source on GitHub (external)` links; the mobile footer wraps instead of overflowing at 200% text size. | Browser metadata/footer regression checks accessible name, href, and target on every route; `reflows the 390px start page…` passed; [live mobile screenshot](./qa-artifacts/polish-2-live/screenshot-mobile.png). |

## Acceptance evidence

- Local `npm test`: 7 Vitest tests and 48 Playwright tests passed.
- Local `npm run build`: passed; output is `dist/`; initial JavaScript is
  12,681 bytes gzip and CSS is 5,516 bytes gzip.
- Fresh clone of `5087b01597fbd2217d0155ae79aa92e3f33508b9`: `npm ci`, every
  exact command listed by all 20 entries in `.factory/claims.json`, and
  `npm run build` passed. Each claim command ran its one tagged browser test.
- `/opt/fleet/lib/verify-url.sh` passed locally and on production. The
  production report has title, language, one h1, main landmark, complete image
  alt text, labelled buttons, and zero console errors: [verify.json](./qa-artifacts/polish-2-live/verify.json).
- The full browser suite uses the Playwright Axe integration at desktop and
  390 px for import, demo, both themes, workspace, Privacy, and Terms; no
  serious or critical findings passed through the suite.
- Cold production recheck is recorded in [live-audit.md](./qa-artifacts/polish-2-live/live-audit.md), with [desktop](./qa-artifacts/polish-2-live/screenshot-desktop.png) and [mobile](./qa-artifacts/polish-2-live/screenshot-mobile.png) captures.

No finding from `review-1.md`, `polish-1.md`, or `review-2.md` remains open.
