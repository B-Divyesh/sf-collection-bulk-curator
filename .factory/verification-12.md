# Independent verification 12 — PASS

**Work order:** `collection-bulk-curator-verify-12`  
**Candidate:** `f310e4706118c044fb864279fd9e359d181ffacf`  
**Live URL:** <https://collection-bulk-curator.sociobot.in/>  
**Verified:** 2026-09-02 UTC

## Release verdict

**PASS.** The deployed static site is the requested candidate and meets the
researched brief's local, reversible CSV batch-curation workflow. No product
code was changed in this verification.

## First read and demo

Cold desktop landing-page read: “Stage bulk catalog edits before export.” It
plainly says it is for collectors updating a chosen subset while preserving the
original catalog, and the first action is **Try it with sample data**, with the
adjacent explanation “Loads 32 sample items in the review desk.” One click
opened 32 realistic catalog records and the persistent **Demo — sample data,
nothing is saved** banner with Reset demo and Start for real. This passes the
plain-words and one-click sandbox gates.

## Mandatory gates

- `.factory/claims.json` exists with 20 claims. After `npm ci`, every exact
  listed `npm test -- --grep @claim:<id>` command completed successfully:
  sample-catalog, local-data, remote-thumbnails, exact-ids, patch-csv,
  undo-manifest, demo-isolation, offline-reload, desk-plus-price,
  desk-plus-session, daily-license-check, license-request-boundary,
  no-tracking, csv-heading-mapping, csv-format-support, id-validation,
  local-thumbnail-matching, filter-visible-results, source-rows-unchanged,
  and free-core-workflow (20/20).
- `npm ci`: PASS; 61 packages installed; audit reported 0 vulnerabilities.
- `npm test`: PASS; 7 Vitest tests and 48 Playwright tests passed.
- `npx tsc --noEmit`: PASS. There is no configured lint script.
- `npm run build`: PASS; generated `dist/` and service-worker cache
  `collection-batch-desk-rf310e4706118-2c30a2e6c041`.
- Build budget: JS 39,184 B (12,722 B gzip), CSS 21,337 B (5,525 B gzip),
  no font payload, and mobile AVIF 18,331 B. All are within static-web limits.

## Product exercise

- Live demo: selected ID `0001`, staged location `Independent QA shelf`, and
  downloaded patch `ID,Location / 0001,Independent QA shelf` plus undo
  `ID,Location / 0001,Map drawer`. Undo then disabled the patch export.
- Live 390 × 844 regression: opened Filters and typed `Glazed` sequentially.
  The drawer stayed open and non-inert, `#search` stayed focused, eight cards
  remained, and document width stayed 390 px. This verifies the repaired
  prior P1 mobile-search defect.
- The complete local browser suite also covers malformed input recovery,
  duplicate/blank IDs, arbitrary mappings, quoted and multiline BOM CSV,
  local thumbnails, 1,000 rows, source-row preservation, and free export.

## Accessibility, privacy, PWA, and response policy

- `/opt/fleet/lib/verify-url.sh` passed live: HTTPS 200, title, `lang=en`, one
  `h1`, main landmark, image alt attributes, named buttons, and no console
  errors.
- Independent axe 4.10.2 checks reported zero serious/critical findings on
  desktop landing, desktop demo, 390 px demo, Privacy, Terms, and 404.
- Keyboard smoke test passed: Tab reaches a visible 3 px focus ring on the
  skip link, Enter moves focus to main, Enter opens the sample desk, and Space
  selects a focused catalog checkbox. Reduced-motion mode reduced motion to
  0.01 ms.
- The full live demo/stage/export request log contained only the product
  origin (document, JS, CSS, and local hero asset); cookies, page errors, and
  console errors were empty. Claims separately prove remote-thumbnail opt-in
  and that license verification sends only its token in an empty-body GET.
- Responses include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, and a response-header CSP with
  `frame-ancestors 'none'`. HTML revalidates after 30 seconds; hashed JS/CSS
  have `public, max-age=31536000, immutable`; `sw.js` is `no-cache`.
- PWA update/offline check passed in a fresh 390 px context: after service
  worker control, an offline reload retained the 32-item demo, demo banner,
  and “Offline · local tools still work” status without errors.
- The product-owned license verification boundary allowed 30 requests from one
  client; request 31 returned `429` with `Retry-After: 1` (subsequent requests
  remained rate-limited). The product has no sign-in or product-owned backend,
  so Entra, backend concurrency, and persistence checks do not apply.

## Deployment parity and performance

Fresh `dist/` matched live byte-for-byte for `index.html`, hashed JS, hashed
CSS, `sw.js`, Privacy, Terms, 404, `robots.txt`, and `sitemap.xml`. In
particular, fresh and live `sw.js` both SHA-256 to
`cf98d35ae147c4f408ec6b8cf4fc12b1185b75313e4aaaa21d828477da04a714`.
The live unknown route returned the styled 404 with HTTP 404.

Fresh Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best
Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 80 ms, CLS 0, transfer
101 KiB.

## Defects

None found. The previously reported mobile filter and deployment-parity P1
findings are fixed in this candidate and verified above.
