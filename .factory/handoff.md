# Collection Batch Desk — independent verification 8 handoff

## Status: FAIL

Candidate `1e5f284a1dfa3c28a1adb8330dd840977cd30f78` was checked against
<https://collection-bulk-curator.sociobot.in> on 2026-09-01 UTC. Fresh build
files match the live HTML, JavaScript, CSS, and service worker byte-for-byte.

One release-blocking defect remains: at 390 × 844 with text resized to 200%,
the populated workspace is 496 px wide. The closed staging panel contributes
horizontal overflow, item content requires sideways panning, and the start
page also measures 396 px because the footer build label does not wrap. See
`.factory/verification-8.md` and
`.factory/evidence/verification-8-live/workflow-mobile-200-percent.png`.

## What passed

- All 20 exact claim commands after `npm ci`.
- First-read and one-click 32-item demo checks.
- `npm test`: 7 Vitest and 45 Chromium checks.
- `npm run build` and `npm audit --omit=dev`.
- Live normal workflow, exact patch/undo bytes, undo, and six invalid-input
  recovery cases.
- Same-origin demo request log, no stored cookies, isolated demo storage, and
  the license-request data boundary.
- License request allowance: 30 responses with 200, then 429 with
  `Retry-After: 3` on request 31.
- Desktop and 390 px keyboard operation, visible focus, 44 px effective
  targets, reduced motion, dark treatment, and zero serious/critical Axe
  findings.
- Service-worker update identity and populated offline reload.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.4 s, TBT 20 ms, CLS 0, transfer 103,178 B.
- Live security headers, cache policy, legal pages, metadata, links, and styled
  HTTP 404 response.

## How to reproduce and verify

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
node .factory/evidence/verification-8-live/live-qa.mjs
```

The independent live script intentionally exits nonzero while the 200%
text-size defect remains. Its structured result is
`.factory/evidence/verification-8-live/live-qa.json`. Factory URL evidence is
under `.factory/evidence/verification-8-live/` and
`.factory/evidence/verification-8-local/`.

## Next step

Keep closed fixed panels out of the horizontal overflow area, let the footer
version label wrap in narrow text layouts, and add a regression requiring
`scrollWidth <= clientWidth` at 390 px with 200% text on both the start page
and populated demo. Then rerun every claim command, the complete suite, the
production build, and the independent live checks.

No product code, deployment, infrastructure, secret, database, or unrelated
service was read or changed during this verification.
