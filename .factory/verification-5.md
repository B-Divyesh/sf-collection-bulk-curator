# Independent verification 5 — FAIL

**Work order:** `collection-bulk-curator-verify-5`  
**Candidate:** `f0ddcc8513082ce03d32264bda57d7c5cc5e39bd` (`main`)  
**Live URL:** <https://collection-bulk-curator.sociobot.in>  
**Verified:** 2026-08-30 UTC

## Release verdict

**FAIL — release-blocking acceptance-contract failures.** The deployed static application is the candidate, and its ordinary local CSV batch-edit workflow works. It cannot be accepted because it has no required claims manifest or claim tests, and its landing/demo experience fails the mandated first-read and isolated one-click demo contract.

## Blocking defects

### P1 — `.factory/claims.json` is absent; advertised claims have no required tests

The clean candidate has no `.factory/claims.json` (`rg --files -g '.factory/claims.json'` returned no file). Therefore there were **zero claim commands to run**, which itself is release-blocking under the work order.

This is not an empty-claims product: the live first screen states **“Never uploaded”**, **“IDs kept verbatim”**, and **“Undo manifest included”**, while the README also makes privacy, export, and local-storage promises. No `@claim:` tests exist in `tests/` or `src/` to prove these visitor-reliant statements from the demo entry point. The ordinary 21-test Playwright suite does not substitute for the required manifest-to-test mapping.

### P1 — first screen and sample path do not provide the required plain-words demo sandbox

Cold live-page reading produced:

> “Change the right items. See every mark first.”  
> “Bring a catalog CSV and optional thumbnails. Filter a precise subset…”  
> “Try a 32-item sample”

It explains that CSV fields can be changed, but does not say that it is for **collectors** on the first screen. The required one-click action named **“Try it with sample data”** is absent (Playwright exact-role count: `0`); the different label `Try a 32-item sample` is present.

The sample button does load the 32-row mapping flow, but it is not the required isolated demo:

- `https://collection-bulk-curator.sociobot.in/?demo=1` remains on the import landing screen; it does not load sample data.
- No persistent `Demo — sample data, nothing is saved` banner, **Reset demo**, or **Start for real** action is rendered before or after sample loading.
- `.factory/demo.md` is absent, and the app has no `demo:` storage namespace.

The verifier consequently cannot use the documented demo URL or prove the required separation between demo and real user data. This also fails the explicit first-screen acceptance test before any deeper product behavior is considered.

## Evidence that passed

### Clean checkout and repository gates

- Worktree started clean at the exact candidate SHA shown above.
- `npm ci`: **PASS** — 61 packages installed; npm reported 0 vulnerabilities.
- `npm test`: **PASS** — 6 Vitest unit tests and 21 Chromium Playwright tests (the runner's `test-results/.last-run.json` records `status: "passed"`).
- `npm run build`: **PASS** — `tsc --noEmit`, Vite production build, and the service-worker generator completed; `dist/` was emitted. No lint script is defined in `package.json`; the TypeScript no-emit check is the available type gate.

### Core job-to-be-done and recovery coverage

- Fresh live desktop exercise: sample → map columns → review desk → select all 32 rows → stage `location = Archive room` → export patch → undo. The patch had BOM-prefixed header `ID,Location` and exactly 32 records; after undo the patch-export button was disabled.
- The passing browser suite covers malformed CSV, ambiguous/whitespace IDs, duplicate semantic mappings, exact ID preservation in patch and undo bytes, thumbnail handling, selection-scope safety, clear-session behavior, and export/undo recovery.

### Live deployment identity, privacy, accessibility, and PWA

- Fresh `dist/` SHA-256 byte-matched live `index.html`, hashed JavaScript and CSS, `sw.js`, privacy/terms pages, robots, sitemap, and favicon. The live deployment is this candidate, not a stale artifact.
- Independent live Playwright request capture across the successful sample import/review/stage/export workflow observed only `https://collection-bulk-curator.sociobot.in`; it produced no console or page errors. This supports the default local-first behavior, but does not cure the missing privacy claim test.
- Independent Axe 4.10.2 scans of the live import page at 1440×900 and 390×844 returned zero serious/critical violations. Mobile had no horizontal overflow (390 px scroll width), and reduced motion computed to `0.00001s`. The passing suite additionally covers keyboard focus, skip link, mobile drawers, legal pages, and workspace Axe scans.
- Live PWA check: `navigator.serviceWorker.ready` resolved to `/sw.js`; after reload the page was controlled by that worker. A 390 px offline reload kept the product h1 and showed `Offline · local tools still work`. The passing `@regression:pwa-upgrade` test also exercises the legacy-v3-to-current persistent-client upgrade.
- Root/legal HTML uses 30-second revalidation; hashed JS/CSS use one-year immutable caching; `sw.js` is `no-cache`. Live responses include HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and CSP with `frame-ancestors 'none'`. An unknown path returned 404.
- Production JS is 35,002 B (11,867 B gzip); CSS is 18,790 B (5,184 B gzip); no font files ship. These are within the static performance budgets.

### Billing endpoint allowance

The static product has no product-owned server endpoint. The documented Sociobot license verifier was probed from one client with an invalid token. It returned HTTP 429 on request **31** after 30 requests, with `Retry-After: 3`; observed allowance: **30 requests per current window**.

## Required remediation before resubmission

1. Add `.factory/claims.json` and one runnable demo-entry-point test for every visitor-facing claim, including local privacy, exact-ID retention, patch CSV, undo manifest, and offline behavior where claimed.
2. Implement and document `?demo=1` (or `/demo`) as a separate demo storage namespace. Add the persistent demo banner, Reset demo, Start for real, and the exact first-screen **Try it with sample data** action.
3. Rewrite the first-screen supporting sentence to name collectors and their bulk-curation situation in plain words, then repeat the first-read and all claim tests from a clean browser context.

This is a static PWA, not a library, CLI, or backend; consumer package installation and backend concurrency/health checks are not applicable. No product code or deployment was modified during verification.
