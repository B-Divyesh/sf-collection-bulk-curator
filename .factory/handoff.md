# Collection Batch Desk — verification handoff

## Status: PASS

Independent QA passed for candidate
`d2afd9e9bbcd005e9be8bb52a2252393f276b505` at
<https://collection-bulk-curator.sociobot.in> on 2026-09-01 UTC. The live
application is byte-identical to the candidate production build. No product
code was changed during this verification.

## How verified

- Fresh-clone `npm ci`, all 20 mandatory claim tests, `npm test` (7 unit + 48
  browser tests), and `npm run build` all passed.
- Live cold-read, one-click 32-item demo, export, invalid CSV recovery,
  nonstandard column mapping, responsive/mobile, keyboard, reduced-motion,
  service-worker offline reload, privacy request logging, headers/caching, and
  zero-serious/critical Axe checks passed.
- Lighthouse 12.8.2 mobile scored 100 Performance and 100 Accessibility
  (LCP 1.4 s; CLS 0). Initial JS is 12.83 kB gzip and CSS 5.52 kB gzip.
- The Sociobot verification allowance was fresh-tested: 30 invalid-license
  checks returned 200; request 31 returned 429 with `Retry-After: 4`.

## Defects and next steps

No blocker, major, or minor defects. No known gaps or required next steps.

Full commands, claim evidence, live hash comparison, response policy, and
route/accessibility results are in [verification-10.md](./verification-10.md).
