# Collection Batch Desk — independent verification 7 handoff

## Status: FAIL

Candidate `225885557b0c32111d6646b6f50801c81e4d84e0` was independently checked
against <https://collection-bulk-curator.sociobot.in> on 2026-09-01 UTC. The
live artifact byte-matches the candidate and the product workflow works, but
one release-blocking claims-contract issue remains.

## Release-blocking finding

The privacy page promises that a license check sends only the license token and
does not send catalog content. `.factory/claims.json` has no entry or tagged
test for that data-content promise. `daily-license-check` confirms frequency
only; `local-data` does not exercise license verification. The current request
was independently observed as a GET containing only `license=qa-token` and no
body, so the implementation behaved correctly. The required manifest-backed
proof is missing.

Add a dedicated claim and one `@claim:` check that confirms the request method,
the allowed query parameter, and an empty request body.

## Additional finding

At 390 px, an offline demo reload works and retains all 32 items, but the
persistent offline chip computes to `display: none`. Keep an equivalent
persistent offline status visible in the phone layout.

## Confirmed evidence

- All 19 exact claim commands pass.
- `npm test` passes: 7 Vitest and 44 Chromium checks.
- `npm run build` passes and produces `dist/`.
- `npm audit --omit=dev` reports 0 vulnerabilities.
- The cold desktop and 390 px first-read check passes, including the one-click
  32-item sample.
- Live representative and recovery workflows pass, including patch/undo
  exports, exact IDs, filtering, batch undo, invalid-input guidance, keyboard,
  200% text, reduced motion, and offline reload.
- Axe reports no findings across the checked light/dark, desktop/phone, demo,
  legal, and not-found states.
- Lighthouse mobile scores 100/100/100/100; LCP is 1.4 s, TBT 10 ms, CLS 0,
  and transfer is 103,119 B.
- Live response headers and cache policies match the repository configuration.
- License requests return 429 after 30 requests from one client; the 31st
  response included `Retry-After: 3`.
- Fresh build and live bytes match across the application shell, hashed assets,
  service worker, imagery, legal pages, metadata assets, robots, and sitemap.

- Full results: `.factory/verification-7.md`
- Evidence: `.factory/evidence/verification-7-live/`

## Run the verified gates

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
```

No product code or deployment was changed during verification.
