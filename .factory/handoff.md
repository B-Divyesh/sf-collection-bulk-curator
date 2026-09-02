# Collection Batch Desk — verification 11 handoff

## Status: FAIL

Independent verification tested candidate
`5087b01597fbd2217d0155ae79aa92e3f33508b9` and
<https://collection-bulk-curator.sociobot.in/> on 2026-09-02 UTC. No product
code was changed.

Release is blocked by two P1 findings:

1. At 390 px, typing into **Search everything** closes and inerts the filter
   drawer after the first character, drops focus to `<body>`, and discards the
   remaining keystrokes. This reproduces in the fresh candidate build and live.
2. Production `/sw.js` identifies build `36718d9f96b4`, while the candidate
   build identifies `5087b01597fb`; the live deployment is not byte-identical
   to the requested candidate.

Full evidence and remediation are in
[verification-11.md](./verification-11.md).

## Verification summary

- All 20 exact claim commands: PASS at the candidate.
- `npm ci`: PASS, 0 vulnerabilities.
- `npm test`: PASS, 7 unit tests and 48 browser tests.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/` produced.
- Cold first read and one-click 32-item demo: PASS.
- Desktop end-to-end import, stage, patch/undo export, and undo: PASS.
- Invalid-input recovery and 15 MiB boundary: PASS.
- Axe serious/critical at desktop, dark, 390 px, legal, and 404: 0.
- Live request log/privacy headers/caching: PASS.
- License API rate limit: 30 allowed; request 31 returned 429 with
  `Retry-After: 4`.
- Live PWA update and offline reload: PASS.
- Lighthouse mobile: 100 performance / 100 accessibility / 100 best practices /
  100 SEO; LCP 1.4 s and CLS 0.

## Next steps

Fix the mobile search rerender/focus state, add a sequential-typing regression,
deploy the exact reviewed commit, and repeat verification. Do not release this
candidate as-is.
