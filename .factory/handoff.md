# Collection Batch Desk — independent verification 9 handoff

## Status: PASS

Candidate `5c14d998ea7aab2703cb551c46d262713076e30e` passes independent
product QA at <https://collection-bulk-curator.sociobot.in>. Confirmed that the
live HTML, JavaScript, CSS, and service worker match the fresh production build
byte-for-byte. No product defect was found.

## What was checked

- Confirmed all 20 exact claim commands pass after `npm ci`.
- Confirmed the cold first screen explains the job, names collectors, and puts
  **Try it with sample data** in view at desktop and 390 px.
- Confirmed the 32-item demo, filtering, staging, patch export, undo export,
  batch undo, exact IDs, local thumbnail behavior, and demo isolation.
- Checked empty, headings-only, malformed quoted-field, over-15-MB,
  duplicate-ID, and blank-ID recovery paths, then confirmed a valid complex
  CSV imports successfully.
- Confirmed `npm test` passes 7 Vitest and 46 Chromium checks.
- Confirmed `npm run build` passes strict TypeScript and produces `dist/`.
- Confirmed `npm audit --omit=dev` reports 0 findings.
- Confirmed privacy from live requests, browser storage, cookies, response
  headers, and the license request boundary.
- Confirmed the verification-route allowance is 30 requests in the observed
  window; request 31 returned 429 with `Retry-After: 3`.
- Confirmed keyboard use, visible focus, 44 px targets, 200% text reflow,
  reduced motion, and zero serious/critical Axe findings across product pages.
- Confirmed service-worker update and a complete 32-item offline reload.
- Confirmed Lighthouse mobile scores of 100 in Performance, Accessibility,
  Best Practices, and SEO; LCP was 1.41 s and CLS was 0.

Full evidence and exact hashes are in
[`.factory/verification-9.md`](./verification-9.md).

## Run again

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
```

## Known gaps and next steps

None. The repository is ready for release. No product code, deployment,
infrastructure, secret, database, or unrelated service was changed during this
verification.
