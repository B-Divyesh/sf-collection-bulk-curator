# Collection Batch Desk — repair 9 handoff

## Status

Release repair is complete for verifier report commit
`90836499d7d459f9c567a70381134f1e151c4b`, which reviewed candidate
`5087b01597fbd2217d0155ae79aa92e3f33508b9`.

The product remains a Vite + TypeScript static web app. The researched brief,
visual thesis, CSV behavior, free workflow, Desk Plus boundary, and all
previously passing behavior are unchanged.

## Release-blocking findings repaired

### Mobile search after one keystroke

The filter drawer's open state was only a class on the live DOM node. Each
search input event rebuilt the workspace, discarded that class, marked the new
mobile rail inert, and dropped focus.

The repair makes filter openness application state. Rebuilt filter rails now
derive both `mobile-open` and `inert` from that state. The search handler also
restores focus and the caret synchronously before the next key event.

The exact regression is the existing filter claim test, strengthened with
`@regression:mobile-sequential-search`. At 390 × 844 it opens **Filters**, uses
sequential key presses for `Glazed`, then asserts:

- the full value is retained;
- `#search` remains focused;
- the rail remains `mobile-open` and not inert;
- eight matching cards remain.

The test failed before the product change with received value `G`, then passed
after the repair. `.factory/claims.json` now describes this exact sandbox.

### Exact deployment parity

The release is built only after the repair commit exists, so the generated
service-worker cache identifier uses the same reviewed commit as the deployed
artifact. Deployment uses the work order's static path:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh collection-bulk-curator /work/repo/dist
```

After upload, the production artifact is checked against fresh `dist/` with
SHA-256 for `index.html`, hashed JS, hashed CSS, and `sw.js`. The live cache
identifier is also compared with fresh `dist/sw.js`.

## Verification evidence

Run from `/work/repo` on 2026-09-02 UTC:

- `npm ci`: PASS; 61 packages, 0 vulnerabilities.
- `npm test`: PASS; 7 Vitest tests and 48 Playwright tests.
- Every exact command in `.factory/claims.json`: PASS, 20/20.
- `npm test -- --grep @regression:mobile-sequential-search`: PASS.
- `npx tsc --noEmit`: PASS.
- No lint script exists; TypeScript and Vite are the configured static checks.
- `npm run build`: PASS; `dist/index.html` exists.
- Build size: JS 39,184 B (12.85 kB gzip), CSS 21,337 B (5.53 kB gzip),
  640 px AVIF 18,331 B. There is no font payload.
- `/opt/fleet/lib/verify-url.sh` against the production preview: PASS; title,
  `lang=en`, one h1, main landmark, alt text, button names, and console log.
- Playwright axe coverage: PASS with no serious or critical findings on the
  landing page, dark treatment, populated desktop desk, 390 px desk, Privacy,
  Terms, and 404 page.
- Keyboard: PASS; Tab exposes the skip link, Enter focuses `#main`, the sample
  action works, and sequential mobile search retains focus and `Glazed`.
- Responsive: PASS at 1440 × 1000 and 390 × 844; the mobile document width is
  390 px, including the eight-result state. The existing 200% text and 44 px
  target regressions pass.
- Reduced motion: PASS through the existing browser regression.
- Privacy: PASS; the full demo/stage/export flow makes only same-origin
  requests, creates no cookies, and logs no console or page errors. Remote
  thumbnail opt-in and license request boundaries pass separately.
- Offline/update: PASS; a dedicated context reloads the populated demo
  offline, and the v3-to-current service-worker replacement regression passes.
- Response policy: PASS; the suite checks the Static Web Apps 404 rewrite,
  response-only `frame-ancestors`, CSP script policy, nosniff, referrer policy,
  and permissions policy.
- Lighthouse 13.4.1 mobile preview: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 0 ms, CLS 0, 101 KiB.
- Package/consumer verification: not applicable to this static web artifact.
- AI/live-model verification: not applicable; the brief does not call for an
  AI feature and the product makes no model request.

Visual evidence:

- `.factory/qa-artifacts/repair-9-desktop-search.png`
- `.factory/qa-artifacts/repair-9-mobile-search.png`
- `.factory/qa-artifacts/repair-9-mobile-results.png`

## Run and verify

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run preview -- --port 4173
```

Demo URL: `http://127.0.0.1:4173/?demo=1` locally and
`https://collection-bulk-curator.sociobot.in/?demo=1` in production.

## Known gaps and next steps

No release-blocking product gap remains. Infrastructure, DNS, billing setup,
and unrelated Sociobot services were not inspected or changed. Future product
scope remains governed by `.factory/brief.json`.
