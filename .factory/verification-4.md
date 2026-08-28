# Independent verification 4 — FAIL

**Work order:** `collection-bulk-curator-verify-4`  
**Candidate:** `49724c9cb569ecc0204e6b13af39c0c62a1ff2a9` (`main`)  
**Live URL:** <https://collection-bulk-curator.sociobot.in>  
**Verified:** 2026-08-28 UTC

## Release verdict

**FAIL — a returning PWA client is not upgraded to this candidate.** Direct
network responses and a fresh browser receive files that byte-match the
candidate, and the repaired product workflows pass. However, the candidate
ships the exact same service-worker bytes and cache name as the preceding
deployed build. Its cache-first handler therefore continues serving the old
HTML and old JavaScript to an already-controlled browser, even after an
explicit service-worker update and an online reload. The old build contains
the release-blocking selection-scope and keyboard-focus defects documented in
`verification-3.md`.

## Defect

### P1 — unchanged service worker strands returning users on the previous defective build

Fresh, controlled reproduction using the real production artifacts from
candidate `fc291527da19b8a0496484652afba58cd82fd914` and this candidate:

1. Built the previous candidate and served its `dist/` on
   `http://127.0.0.1:4180`.
2. Opened that origin in a persistent Chromium profile, waited for service
   worker activation, and reloaded until controlled. The page loaded
   `/assets/index-ULxunsl-.js`; Cache Storage contained
   `collection-batch-desk-v3`.
3. Changed the same origin's server root to the fresh `49724c9` `dist/`.
   A direct `curl` now returned HTML referencing
   `/assets/index-C_bR1aIn.js`.
4. Relaunched the same browser profile, navigated online, called
   `registration.update()`, waited, and reloaded.
5. **Actual:** the controlled page still loaded
   `/assets/index-ULxunsl-.js`, with only `collection-batch-desk-v3` present.
   An offline reload also loaded the old JS and complete old shell.

`public/sw.js` has SHA-256
`5d143fad46a371a15ffffc6a2c407381820928d45cb705456e818d9b80d16618`
in both `fc291527...` and `49724c9...`; its cache constant is unchanged at
`collection-batch-desk-v3`. Since the service-worker script is byte-identical,
the browser installs no new worker and the install-time cache refresh never
runs. This fails the explicit PWA update requirement and means the live
experience does not reliably match the candidate for existing users.

Required remediation: version the service worker/cache for every release (or
implement a network/update strategy that refreshes navigations and versioned
precache entries), deploy it, then repeat an old-build-to-new-build persistent
profile upgrade test. A fresh-profile offline test alone does not exercise
this failure.

## Evidence that passed

### Clean checkout and repository gates

- Verification ran from a separate clean detached checkout at exactly
  `49724c9cb569ecc0204e6b13af39c0c62a1ff2a9`; fetched `origin/main` resolved
  to the same SHA.
- Node `v22.23.2`, npm `10.9.8`.
- `npm ci`: PASS, 61 packages, 0 vulnerabilities.
- `npm audit --omit=dev`: PASS, 0 vulnerabilities.
- `npm test`: PASS — 6 Vitest tests and 20 Chromium Playwright tests.
- `npm run build`: PASS — TypeScript `tsc --noEmit` plus Vite production
  build; `dist/` produced. No separate lint script exists.

### Independent product workflow and recovery

- Imported a BOM-prefixed CRLF CSV with arbitrary mapped headings, quoted
  commas, a multiline field, semicolon/comma tags, remote/local thumbnail
  names, and IDs `0007`, `08`, and `A-9`.
- Filtered to two Archive items, added/deduplicated tags, cleared condition,
  and exported both documents. Exact patch rows retained `0007` and `08`; the
  undo rows restored `ceramic, blue` / `Good` and `paper; framed` / `Fair`.
  Undoing the condition batch preserved the earlier tag batch.
- Fresh recovery checks passed for empty input, headings-only CSV, one-column
  CSV, case-insensitive duplicate headings, an unclosed quote, a file one byte
  over 15 MiB, whitespace-only IDs, duplicate IDs, and repeated semantic
  mappings. A valid file worked immediately after each error path.
- The 32-row sample staged/exported 32 changes in the repository end-to-end
  test. A separate 1,000-row mobile catalog rendered only 120 cards and
  selected all 1,000 matching items in 86.5 ms through two animation frames
  on the supplied Chromium.
- Local thumbnail attachment, empty filtered results and recovery, hidden
  selection clearing, per-item change removal, undo, and confirmed local desk
  clearing are covered by the passing browser suite.

### Privacy, billing, and outbound traffic

- A fresh free workflow made no third-party request before explicit remote
  image opt-in, set no cookies, and stored only the user-selected theme; no
  catalog/session data was written to local storage.
- After opt-in, the configured remote thumbnail host was contacted. No
  analytics, ads, remote fonts, or third-party runtime scripts were observed.
- Production checkout returned HTTP 303 to the hosted Dodo checkout.
- A real invalid-token return stored
  `sb_license:collection-bulk-curator`, stripped only `license` while retaining
  the other query/hash, made one verifier request, and remained locked. The
  verifier returned HTTP 200, `valid:false`, `reason:"invalid"`,
  `Cache-Control: no-store`, and the correct product-origin CORS header.

### Accessibility, responsive behavior, and browser health

- `/opt/fleet/lib/verify-url.sh` passed locally (530 ms) and live (1,601 ms):
  title, `lang=en`, one `h1`, `main`, image alt text, labeled buttons, and no
  console/page errors.
- Independent axe 4.10.2 scans found zero serious/critical findings on light
  and dark import states, mapping, desktop workspace, the open 390 px ledger,
  privacy, and terms.
- Keyboard checks passed for first-tab skip link and main focus, visible 3 px
  skip/file-control focus rings, Space selection with focus preservation, and
  mobile drawer Escape/trigger-focus return.
- At 390×844 there was no horizontal overflow. Fifty visible primary targets
  measured at least 44×44 CSS px; the smallest dimension was 44 px.
- With `prefers-reduced-motion: reduce`, the tested transition duration was
  `0.00001s`; hover movement is removed by CSS.
- Independent local and live flows had zero console errors, page errors, or
  unexpected failed requests.

### Deployment identity, response policy, caching, and budgets

- Every deployed build artifact except the host-only
  `staticwebapp.config.json` byte-matched fresh `dist/`, including HTML, JS,
  source map, CSS, all images, legal pages, service worker, robots, sitemap,
  and favicon. Examples: `index.html`
  `736157b3...e72871cd`, JS `734ab351...cf760cb`, CSS
  `28f6469d...e04a735`, and service worker `5d143fad...d16618`.
- HTTP redirects to HTTPS. Root and legal HTML return 200 with
  `public, must-revalidate, max-age=30`; hashed JS/CSS use one-year immutable
  caching; `sw.js` uses `no-cache`; an unknown route returns 404.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, and CSP limiting scripts/styles to self,
  framing and objects to none, and connections to self plus the documented
  Sociobot API origins.
- Fresh build sizes: JS 35,002 bytes / 11,868 gzip; CSS 18,790 bytes / 5,193
  gzip; no fonts; mobile AVIF 18,331 bytes; mobile WebP 33,618 bytes; total
  `dist/` file bytes 403,078. All static budgets pass.
- Fresh Lighthouse 12.8.2 mobile run against live: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 971 ms, LCP 1,423.5 ms,
  TBT 18.5 ms, CLS 0, Speed Index 971 ms, TTI 1,427.85 ms.
- A fresh-profile service-worker install/update and offline shell reload pass;
  only the required upgrade from an already installed release fails.

## Applicability and scope

This is a static PWA, not a library, CLI, or backend. Consumer package
installation, server concurrency, database persistence, and backend health
identity checks do not apply. No product code or deployment was modified.
