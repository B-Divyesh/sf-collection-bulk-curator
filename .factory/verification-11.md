# Independent verification 11 — FAIL

**Work order:** `collection-bulk-curator-verify-11`  
**Candidate:** `5087b01597fbd2217d0155ae79aa92e3f33508b9`  
**Live URL:** <https://collection-bulk-curator.sociobot.in/>  
**Verified:** 2026-09-02 UTC

## Release verdict

**FAIL — the 390 px filter search breaks after its first typed character, and
the deployed service worker is not the candidate build.** No product code was
changed during this verification.

## Release-blocking findings

### P1 — mobile search closes after one keystroke

The core catalog search cannot be typed on the required 390 px phone layout.

Reproduction on both the fresh candidate build and production:

1. Open `/?demo=1` at 390 × 844.
2. Choose **Filters**.
3. Type `Glazed` into **Search everything** with normal sequential keystrokes.

Observed after the first key:

- the input contains only `G`;
- the filter drawer loses `mobile-open` and becomes `inert`;
- focus moves from `#search` to `<body>`;
- the remaining keystrokes are discarded and all 32 cards remain shown.

Desktop control evidence: the same sequential input retains `Glazed`, keeps
focus in `#search`, and narrows the catalog to 8 items.

The cause is the search `input` handler calling `render()`. On a narrow
viewport, the rebuilt filter rail is immediately made inert and its open state
is not restored. This blocks an advertised part of the smallest useful product
on mobile and fails the keyboard/mobile definition of done. The existing test
uses Playwright `fill()`, which emits the complete value in one event and does
not reproduce real typing.

### P1 — production is not the exact candidate build

Fresh `dist/sw.js` contains:

```text
collection-batch-desk-r5087b01597fb-1f41d1865b1f
```

Production `/sw.js` contains:

```text
collection-batch-desk-r36718d9f96b4-1f41d1865b1f
```

Their SHA-256 values are respectively
`e1f52862facfb319acf22ea69c10986395f32b8b8dadd458f2ed54ed941cc274`
and
`5770ab540fc390ff1378ac0028b3307578c69340119f0ef3c7ad2eed3319e1f4`.
Commit `36718d9f96b4dfa04e5a5da99306b21a11b51212` is the documentation-only
child of the requested candidate, so application behavior is equivalent, but
the work order requires the live deployment to match the candidate. The live
service worker explicitly identifies a different build.

## Mandatory gate results

### Claims and first read

- `.factory/claims.json` exists and contains 20 entries.
- After `npm ci`, every exact listed command passed at candidate `5087b015…`:
  20/20 claim commands, no failures.
- Cold first read at 390 × 844: **PASS**. The screen says it stages bulk
  catalog edits for collectors, and **Try it with sample data** is fully in the
  opening viewport at y=326–373. One click opens 32 realistic items and the
  persistent “Demo — sample data, nothing is saved” banner with reset and exit.
- Cross-checking the landing page, legal pages, and README found no additional
  unsupported claim that changes this verdict.

### Clean install, tests, type check, and build

- `npm ci`: PASS; 61 packages installed, 0 vulnerabilities.
- `npm test`: PASS; 7 Vitest tests and 48 Playwright tests.
- `npx tsc --noEmit`: PASS. No lint script exists.
- `npm run build`: PASS and produced `dist/`.
- Fresh asset sizes: JS 39,054 B / 12,682 B gzip; CSS 21,337 B / 5,525 B
  gzip; no font payload. The 640 px AVIF is 18,331 B. All are within budget.

## Independent product exercise

- Demo workflow: selected one item by keyboard, staged a location change,
  exported patch and undo CSVs, then undid the batch. Patch export contained
  `0001,Independent QA shelf`; undo contained `0001,Map drawer`; export was
  disabled after undo.
- Real import and recovery: an unclosed quote produced specific recovery copy;
  the same session then accepted a BOM CSV with arbitrary headings, quoted
  commas, escaped quotes, a multiline cell, and ID `0007`. Clearing condition
  exported `Ref,Grade / 0007,` and undo restored `0007,Good`.
- Boundary input: a file over 15 MiB and a headings-only CSV were both rejected
  with actionable messages while remaining on the import screen. The suite
  also covers blank/duplicate IDs, duplicate semantic mappings, 1,000 rows,
  local thumbnails, hidden-selection clearing, and license restore/revocation.
- Internal links and the GitHub external link returned 200. The product checkout
  route returned 303 to the hosted Dodo checkout.

## Accessibility and responsive evidence

- Independent axe 4.10.2 checks found zero serious/critical issues on the
  desktop landing page, dark treatment, populated desk, 390 px desk, Privacy,
  Terms, and 404 page.
- A clean keyboard pass focused the visible skip link first with a 3 px outline;
  Enter focused `<main>`. Keyboard selection, staging, and both downloads
  worked. The P1 search failure above remains the governing keyboard defect.
- Effective checkbox/switch labels measured at least 44 × 44 px. At 200% root
  text size, both landing and populated demo remained 390 px wide without
  horizontal overflow.
- `prefers-reduced-motion: reduce` matched and capped observed transitions and
  animations at 0.01 ms.
- `/opt/fleet/lib/verify-url.sh` passed production: title, `lang`, one h1,
  `<main>`, alt labels, and no root-page console errors.

## Privacy, headers, rate limit, PWA, and performance

- The complete demo/stage/export request log contained only product-origin
  document, script, style, and image requests. There were no cookies, analytics,
  remote fonts, third-party scripts, console errors, or page errors.
- Root responses include CSP with `frame-ancestors 'none'`, HSTS,
  `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and the
  restrictive permissions policy. Hashed JS/CSS use one-year immutable cache;
  `sw.js` is `no-cache`; HTML revalidates after 30 seconds.
- Product-specific license verification allowed 30 requests in the observed
  window. Request 31 returned `429` with `Retry-After: 4` and CORS allowed only
  the product origin used in the test.
- The live service worker controlled the demo, updated without an error, and
  offline reload restored the 32-item desk plus visible offline status. The
  cache name exposed the deployment mismatch documented above.
- Lighthouse 13 mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 0 ms, CLS 0, total transfer 101 KiB.

## Deployment parity details

Production `index.html`, hashed JavaScript, hashed CSS, Privacy, Terms,
`robots.txt`, and `sitemap.xml` match fresh candidate `dist/` byte-for-byte.
Only the generated service-worker commit token differs. Production served the
expected 404 page with status 404. This product has no sign-in or product-owned
backend; Entra, backend concurrency, and server persistence checks do not
apply.

## Required remediation

1. Preserve the mobile filter drawer's open/inert state and focus across search
   rerenders. Add a regression using sequential keyboard input, not `fill()`.
2. Deploy from the exact reviewed commit and verify `sw.js` byte-for-byte with
   that commit's fresh build.
3. Rerun all 20 claim commands, the full suite, the 390 px keyboard path, PWA
   update/offline reload, and deployment parity before release.
