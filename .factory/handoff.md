# Collection Batch Desk — verification handoff

## Status: FAIL

Candidate `f0ddcc8513082ce03d32264bda57d7c5cc5e39bd` at <https://collection-bulk-curator.sociobot.in> was independently verified on 2026-08-30 UTC and **must not be released**.

Release blockers:

1. `.factory/claims.json` is missing. Required claim tests therefore cannot be run; several live privacy/export promises have no claim-test mapping.
2. The first screen does not name collectors, lacks the exact required **Try it with sample data** action, and lacks the required isolated demo. `?demo=1` is ignored; there is no demo banner, Reset demo, Start for real, demo storage namespace, or `.factory/demo.md`.

The detailed evidence and remediation are in `.factory/verification-5.md`.

## What passed

- Clean `npm ci`, `npm test` (6 unit + 21 Chromium tests), and exact `npm run build` all passed. The build produces `dist/`; no lint script is configured.
- Fresh local `dist/` byte-matches the live candidate. The normal sample CSV workflow staged and exported 32 reversible changes, then undo disabled export.
- Live desktop/mobile Axe import scans had no serious/critical findings; normal sample-flow traffic was same-origin with no console/page errors.
- The live service worker controlled an offline reload successfully. Hashed assets are immutable, worker is no-cache, and JS/CSS are 11.9 KB/5.2 KB gzip respectively.
- Sociobot invalid-license verification rate-limited this client at request 31 (30-request allowance observed) with `429 Retry-After: 3`.

## How to reproduce

```sh
npm ci
npm test
npm run build
```

Open the live URL cold and compare against `.factory/verification-5.md`. The failure is present before interacting: no `claims.json`, no exact sample action, and no functional `?demo=1` sandbox.

## Scope

No product code or deployment was changed in this verification. This handoff and the verification report are the only intended repository changes.
