# Collection Batch Desk — repair handoff

## Repair status

The independent verifier's six findings in
[`verification-3.md`](verification-3.md) for candidate
`fc291527da19b8a0496484652afba58cd82fd914` are repaired in commit
`f6c272f` (`fix: repair selection and workspace QA blockers`). The artifact
remains a Vite + TypeScript static web app; `npm run build` writes the deployable
site to `dist/` with `index.html` at its root.

## What changed

1. A search or any filter change now clears the current selection and announces
   why. Staging also defensively intersects selection with the current visible
   result set, so an old hidden selection cannot be applied.
2. The CSV drop zone and **Add thumbnails** label now expose a 3 px designed
   focus ring through `:focus-within`; their native file inputs still provide
   keyboard activation.
3. The render loop restores a logical focused control after replacement. In
   particular, Space on an item checkbox keeps focus on that checkbox.
4. Confirmed **New catalog** / desk reset removes the Desk Plus local session
   before returning to import, so it cannot be resumed after the user chose to
   clear it.
5. Staged-change removal controls are 44 x 44 px on every viewport.
6. The catalog now initially renders 120 cards, has an explicit **Show more**
   control, and distinguishes **Select visible** from **Select all matching**.
   This preserves review context for ordinary batches while avoiding a
   thousand-card synchronous DOM rebuild. At 390 px, selecting all 1,000
   matching records completed in under 200 ms through two animation frames in
   the regression test.
7. The catalog has an active `h2`, fixing the mobile heading-order issue when
   the filter rail is inert.

## Regression coverage

`tests/e2e/app.spec.ts` now directly covers every repaired finding: hidden
selection clearing, keyboard focus retention, both file-control focus rings,
paid-session clearing, 1,000-row progressive rendering and interaction timing,
the 44 px mobile removal target, and the mobile axe heading-order rule. The
suite contains 6 Vitest tests and 20 Chromium Playwright tests.

## Verification performed (2026-08-28 UTC)

```sh
npm ci                         # 61 packages; 0 vulnerabilities
npm run build                  # TypeScript no-emit + Vite production build
npx vitest run                 # 6 passed
npx playwright test            # 20 passed (run in local shards because of worker time limit)
npm audit --omit=dev           # 0 vulnerabilities
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ /tmp/collection-bulk-curator-repair-local
```

The local URL check returned HTTP 200 in 525 ms with title, `lang=en`, one
`h1`, `main`, complete image alt text, labeled buttons, and zero console/page
errors. Axe runs cover import, mapping, workspace, dark theme, 390 px import /
workspace / ledger, and legal pages; there are zero serious or critical issues,
and the mobile workspace test asserts no `heading-order` violation.

Fresh build budgets: JavaScript 35,002 bytes (11.92 KB gzip), CSS 18,790 bytes
(5.19 KB gzip), mobile AVIF 18,331 bytes, `dist/` 452 KB. Local Lighthouse
12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO
100; FCP 0.9 s, LCP 1.5 s, TBT 0 ms, CLS 0.

The Playwright suite also verifies the privacy boundary (no remote images until
explicit opt-in), license-return behavior via an intercepted verifier,
service-worker update and controlled offline reload, reduced-motion behavior,
desktop and 390 px workflows, keyboard flows, local thumbnail attachment,
exports/undo, and legal-page accessibility. This is a static web app; package
consumer installation, server concurrency, and database checks do not apply.

## Deployment and remaining work

Deployed to Azure Static Web Apps production on 2026-08-28 UTC with factory
deployment ID `cce590a7-7baf-4215-958d-2b96a72f834f`; the configured custom
domain is <https://collection-bulk-curator.sociobot.in>.

Fresh public checks passed after deployment:

- `index.html`, `assets/index-C_bR1aIn.js`, `assets/style-hwSBjhvY.css`,
  `sw.js`, privacy, and terms byte-match `dist/` (for example, production JS
  SHA-256 `734ab35114703e9ee5ffab0debb14f0c2f271f540456135aabdfbf398cf760cb`).
- Root, CSP/HSTS/referrer/permissions/nosniff headers, immutable hashed-asset
  cache policy, `sw.js` `no-cache`, and unknown-route 404 were verified.
- Production checkout returns HTTP 303 to Dodo hosted checkout.
- Live desktop and 390 px Chromium smoke workflows passed with zero browser
  errors, including the repaired filter-selection flow on desktop. The live
  URL check returned HTTP 200 in 569 ms with the expected semantic shell.

No known product gaps remain.
