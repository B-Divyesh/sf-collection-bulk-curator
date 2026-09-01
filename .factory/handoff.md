# Collection Batch Desk — independent verification 6 handoff

## Status: FAIL

Candidate `f0f0b3ba0b4b02b3d1e0f6846760bc10064e4490` was independently checked at
<https://collection-bulk-curator.sociobot.in> on 2026-09-01 UTC. The live files
byte-match the candidate, all declared claim tests pass, the complete automated
suite and build pass, and the core reversible batch-edit workflow works.

Release remains blocked by four P1 findings:

1. At 390 × 844, **Try it with sample data** begins at y = 1102.66 px, so the
   opening mobile screen does not show what to click first.
2. `.factory/claims.json` omits published claims, including paid workspace
   restore, daily verification frequency, CSV-format support, ID validation,
   and no-analytics/runtime-script statements.
3. A verified Desk Plus workspace is not stored when its CSV is opened. The
   session key stays absent until the first staged edit, despite the automatic
   next-visit restore promise.
4. Mandatory site structure is incomplete: no canonical/OG/Twitter metadata or
   social image, no Apple touch icon, no demo-specific title, no product-styled
   404, and incomplete standard header/footer treatment.

Two P2 mobile findings remain: demo banner actions are 36 px high and the remote
image switch target is 26 px; a selected 1,000-row catalog makes the 390 px page
398 px wide.

## Verification summary

- `npm ci`: PASS — 61 packages, 0 vulnerabilities.
- Every command in `.factory/claims.json`: PASS after the locked install.
- `npm test`: PASS — 7 Vitest and 29 Chromium tests.
- `npm run build`: PASS; `dist/` generated.
- `npm audit --omit=dev`: PASS.
- Independent live demo and real CSV flows: PASS for filtering, staging,
  patch/undo export, undo, demo reset/isolation, exact IDs, malformed-input
  recovery, and the 15 MiB boundary.
- Live Axe desktop/mobile, light/dark, demo, privacy, terms: zero findings.
- Keyboard, reduced motion, 200% text, console/page errors: PASS except the
  touch-size findings above.
- Live PWA update/control and populated offline reload: PASS.
- Billing allowance: requests 1–30 returned 200; request 31 returned 429 with
  `Retry-After: 4`.
- Lighthouse mobile: 98 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 2.03 s, TBT 0 ms, CLS 0.
- Bundles: JS 12.35 kB gzip, CSS 5.30 kB gzip; budgets pass.

Full evidence and remediation detail are in
[`.factory/verification-6.md`](verification-6.md). URL and Lighthouse evidence
is in `.factory/evidence/verification-6-live/`; claim command output and mobile
screenshots are in `.factory/qa-artifacts/`.

No product code or deployment was modified during verification.
