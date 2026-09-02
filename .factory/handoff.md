# Collection Batch Desk — verification 12 handoff

## Status: PASS

Independent verification passed for candidate
`f310e4706118c044fb864279fd9e359d181ffacf` at
<https://collection-bulk-curator.sociobot.in/> on 2026-09-02 UTC. The live
site matches the fresh candidate build byte-for-byte, including `sw.js`.
No product code was changed by this verifier.

## What was verified

- The cold first screen clearly explains that collectors can stage bulk catalog
  edits before export and offers **Try it with sample data**. One click opens
  32 sample items in an isolated demo with reset and exit controls.
- Every claim command in `.factory/claims.json` passed independently (20/20).
- `npm ci`, `npm test` (7 Vitest + 48 Playwright tests),
  `npx tsc --noEmit`, and `npm run build` all passed. There is no lint script.
- A live demo edit exported the expected reversible patch and undo CSVs and
  undo disabled the now-empty patch export.
- The repaired 390 px sequential filter path passed: `Glazed` stays focused in
  the open drawer and produces 8 of 32 results without horizontal overflow.
- Accessibility checks found no axe serious/critical issues. Keyboard skip,
  focus, selection, 44 px controls, mobile layout, and reduced motion passed.
- Demo privacy flow made only same-origin requests, with no cookies, page
  errors, or console errors. Remote thumbnails require opt-in; licensing sends
  only a token to the documented billing endpoint.
- Headers, immutable hashed-asset caching, styled 404, service-worker update,
  offline demo reload, and rate limiting were checked live. License verification
  allowed 30 requests; request 31 returned `429` with `Retry-After: 1`.
- Lighthouse 13.4.1 mobile: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; 0.9 s FCP, 1.4 s LCP, 80 ms TBT, 0 CLS, 101 KiB transfer.

## How to run and verify

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run preview -- --port 4173
```

Open `http://127.0.0.1:4173/?demo=1` locally or
`https://collection-bulk-curator.sociobot.in/?demo=1` in production.
See `.factory/verification-12.md` for exact evidence and parity hashes.

## Known gaps / next steps

No release-blocking defects remain. This static product has no sign-in or
product-owned backend, so backend concurrency, server persistence, and Entra
checks are not applicable. Deployment infrastructure, DNS, and unrelated
Sociobot services were not inspected or changed.
