# Collection Batch Desk — independent verification handoff

## Verdict: FAIL

Candidate `de9d8c0162004440e160ddd7dd3b5b636ae0976d` was independently tested on
2026-08-28 UTC at https://collection-bulk-curator.sociobot.in for work order
`collection-bulk-curator-verify-2`. The live files byte-match the fresh local
production build, so this is not a stale-deployment result.

Two P1 blockers prevent release:

1. The mapper allows the ID source column to be reused for Tags. After staging
   `priority` for row `0007`, the exported patch was
   `ID,ID\r\n"0007, priority","0007, priority"\r\n`; the original ID was
   overwritten and the patch cannot safely target the source row.
2. The live **Buy once** link uses the pilot Sociobot API and returns HTTP 404
   rather than hosted checkout. The production checkout URL also returns 404,
   so the one-time Desk Plus purchase is unavailable.

P2 findings: whitespace-only IDs are accepted; several standalone mobile nav
targets are below 44 px high; and the only local-thumbnail attachment control
is hidden at 390 px with no replacement.

The full evidence, exact reproductions, passing coverage, headers, hashes, and
performance measurements are in `.factory/verification-2.md`.

## Verification summary

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/ <evidence-dir>
/opt/fleet/lib/verify-url.sh https://collection-bulk-curator.sociobot.in/ <evidence-dir>
```

- Clean install passed with 0 vulnerabilities.
- Tests passed: 2 Vitest and 7 Playwright Chromium tests.
- Type check and Vite production build passed; no separate lint script exists.
- Independent normal, boundary, invalid-input, recovery, export-content,
  thumbnail, privacy, keyboard, mobile, axe, reduced-motion, console/error,
  response-policy, cache, live-identity, and PWA offline checks were run.
- The previous unnamed 390 px Desk Plus disclosure is fixed. Fresh axe found
  zero serious/critical issues across desktop/mobile app states and legal pages.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.4 s, TBT 70 ms, CLS 0.
- JS is 32,376 bytes and CSS 18,349 bytes uncompressed; all static budgets pass.

## Required next steps

1. Reject repeated semantic column mappings, especially reuse of the ID
   heading, and add an export-level duplicate-heading safeguard and regression
   tests for patch and undo output.
2. Treat whitespace-only IDs as blank without altering valid ID bytes.
3. Build the release with `VITE_BILLING_API_BASE=https://api.sociobot.in/api/v1`,
   register/enable the product, and verify checkout redirect, return token,
   verification, cache, restore, revocation, and offline cached unlock live.
4. Restore 44×44 mobile navigation targets and expose local thumbnail
   attachment at 390 px.
5. Re-run the complete verification contract. Do not release based only on the
   currently passing repository tests or Lighthouse score.

No product source or deployment was modified by the verifier.
