# Independent verification 9 — PASS

- **Work order:** `collection-bulk-curator-verify-9`
- **Candidate:** `5c14d998ea7aab2703cb551c46d262713076e30e`
- **Live URL:** <https://collection-bulk-curator.sociobot.in>
- **Checked:** 2026-09-01 UTC

## Release result

**PASS.** Confirmed that the candidate satisfies the researched brief and the
factory product contract. No release-blocking, major, or minor product defect
was found. Confirmed that the live deployment matches the candidate build.

## Required first-read check

**PASS.** Checked the live page cold at 1440 × 900 and 390 × 844.

- Confirmed that the headline says what the product does: **Stage bulk catalog
  edits safely**.
- Confirmed that the next sentence identifies collectors updating a chosen
  subset without losing the original catalog.
- Confirmed that **Try it with sample data** is fully visible in the first
  viewport at both sizes and explains that it loads 32 sample items.
- Confirmed that one activation opens 32 populated item cards and shows the
  persistent **Demo — sample data, nothing is saved** banner with **Reset
  demo** and **Start for real**.

The cold request log contained only the page and its same-origin JavaScript,
CSS, and responsive illustration. No console or page error occurred.

## Required claims gate

The clean clone initially had no installed packages, so the pre-install
commands could not start Vitest. After `npm ci`, every exact command in
`.factory/claims.json` ran separately and passed. Each command ran seven
Vitest checks and its selected Chromium claim check.

| Claim | Result | Confirmed outcome |
| --- | --- | --- |
| `sample-catalog` | PASS | One action opened all 32 sample items at 390 px. |
| `local-data` | PASS | Demo editing used only same-origin requests and did not write a real desk session. |
| `remote-thumbnails` | PASS | Remote images stayed off until the user enabled them. |
| `exact-ids` | PASS | The patch retained `0001` exactly. |
| `patch-csv` | PASS | A staged location appeared in the patch CSV. |
| `undo-manifest` | PASS | The undo CSV contained the original location. |
| `demo-isolation` | PASS | Demo reset and exit preserved the real-session sentinel. |
| `offline-reload` | PASS | A dedicated demo context reloaded all 32 items offline. |
| `desk-plus-price` | PASS | The page showed the $19 one-time offer and the hosted checkout route. |
| `desk-plus-session` | PASS | A verified local workspace saved and restored after reload. |
| `daily-license-check` | PASS | Reload within the daily cache made no second verification request. |
| `license-request-boundary` | PASS | The request used GET with only the license query value, no body, and no catalog content. |
| `no-tracking` | PASS | Demo use stayed same-origin and the cookie jar remained empty. |
| `csv-heading-mapping` | PASS | Nonstandard headings mapped into the review desk. |
| `csv-format-support` | PASS | BOM, quoted commas, escaped quotes, and multiline fields imported correctly. |
| `id-validation` | PASS | Blank and duplicate IDs received specific correction guidance. |
| `local-thumbnail-matching` | PASS | A local image matched by filename and rendered from a blob URL. |
| `filter-visible-results` | PASS | Search narrowed the sample to the expected visible cards. |
| `source-rows-unchanged` | PASS | The undo file retained the source value after staging. |
| `free-core-workflow` | PASS | An unsigned user imported, staged, and exported a patch. |

Checked the live copy, README, privacy notice, terms, demo guide, and claims
manifest together. Confirmed that the visitor-facing product promises are
represented by the claims suite.

## Repository and production build

- Confirmed that the starting SHA was the exact candidate.
- `npm ci`: PASS — 61 packages installed; 0 audit findings.
- `npm test`: PASS — 7 Vitest checks and 46 Chromium checks.
- `npm run build`: PASS — strict TypeScript, Vite production build, and
  service-worker generation produced `dist/`.
- `npm audit --omit=dev`: PASS — 0 findings.
- Checked that no separate lint command or lint configuration is present.
  Strict type checking is part of the production build.
- Initial JavaScript: 39,146 bytes, 12,830 bytes gzip.
- Initial CSS: 21,413 bytes, 5,570 bytes gzip.
- Mobile AVIF illustration: 18,331 bytes. No font payload is shipped.

## Independent product workflow and recovery

Confirmed the live demo’s useful workflow independently of the checked-in
tests. Filtering by **Field finds** showed 11 items. Selecting the visible
items, adding `priority, fragile`, and exporting produced an 11-row patch and
an 11-row undo file. Both used the `ID,Tags` heading. The first patch row kept
`0001` and contained the added tags. Undoing the batch disabled export again.

Checked empty, headings-only, unfinished quoted-field, over-15-MB, duplicate-ID,
and blank-ID files. Each produced a specific message explaining what to fix.
Confirmed recovery by subsequently importing a UTF-8 BOM file with a quoted
comma, an escaped quote, a multiline field, and nonstandard headings. Its
exact exported content was `Ref,Grade` followed by `0007,Excellent` with CRLF
line endings.

The full local suite additionally confirms a 1,000-row progressive rendering
boundary, bulk selection, selection clearing after a filter change, local
thumbnail matching, repeated-mapping rejection, confirmation before clearing
a changed desk, and verified Desk Plus session restore.

## Privacy, response policy, and billing

- Confirmed that the independent demo workflow made only same-origin requests,
  stored only `demo:collection-bulk-curator:session`, and stored no cookies.
- Confirmed in a real browser request that license verification used `GET`,
  had only `license=verification-9-invalid` in the query, had no request body,
  and contained no catalog data. The 200 response reported `valid:false`; the
  free sample action remained available, and the token was removed from the
  visible URL.
- Checked that a normal browser context retained no cookies after that
  cross-origin license response.
- Confirmed the documented request allowance on the product’s own verification
  route. Requests 1–30 returned 200. Request 31 returned 429 with
  `Retry-After: 3`. The observed allowance is 30 requests in the current
  window.
- Confirmed that the purchase URL returns 303 to the hosted Dodo checkout. The
  destination was not followed.
- Confirmed in Playwright response headers that production sends HSTS,
  `nosniff`, strict-origin referrer policy, disabled camera/microphone/
  geolocation/payment permissions, and a CSP containing
  `frame-ancestors 'none'`.
- Checked that root HTML revalidates after 30 seconds, hashed assets use a
  one-year immutable policy, and `sw.js` uses `no-cache`.

## Routes, accessibility, responsive behavior, and offline use

- Confirmed that `/`, `/?demo=1`, `/privacy/`, `/terms/`, and the styled 404
  have appropriate titles, `lang=en`, one h1, a main landmark, and image
  alternatives. The unknown route returned HTTP 404.
- Confirmed that all discovered first-party routes and assets returned their
  expected status. The source link returned 200, and the purchase link returned
  its expected redirect.
- `/opt/fleet/lib/verify-url.sh` passed against the live URL: HTTP 200, no
  console/page errors, title, language, one h1, main landmark, complete image
  alternatives, and labeled buttons.
- Confirmed zero serious or critical Axe findings on the start page in light
  and dark treatments, the demo workspace, privacy, terms, and the styled 404.
- Checked keyboard-only use: the skip link is first, Enter moves focus to main,
  Enter opens the sample, Space selects an item while retaining focus, the
  mobile staging panel receives focus, Escape closes it, and focus returns to
  **Stage changes**. The primary focus ring is a visible 3 px ochre outline.
- Confirmed that tested mobile controls are at least 44 px high and no keyboard
  trap was found.
- Confirmed at 390 × 844 and 200% text that both the start page and populated
  demo measured 390 px scroll width against 390 px client width. In the demo,
  item content ended at 376 px and the closed ledger used `display:none`.
- Confirmed that reduced-motion mode limits transition and animation durations
  to 0.01 ms and that the product has no looping or flashing motion.
- Confirmed that the live service worker updated and controlled the page using
  cache `collection-batch-desk-r5c14d998ea7a-bc0b99f2c751`. The populated
  32-item demo reloaded offline, kept the offline status visible, and produced
  no console or page errors.

## Performance

Lighthouse 12.8.2 mobile results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.91 s |
| Largest Contentful Paint | 1.41 s |
| Total Blocking Time | 16 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 0.99 s |
| Total transfer | 103,258 bytes |

Confirmed that these results meet the supplied static-product budgets.

## Deployment identity

Fresh production output and live bytes matched exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `e01ab90d7a7725a83b1c6fdc9c0ddde3ad8d4ee7a786639d1de4fc06d7bf303f` |
| `assets/index-B1GD3_C1.js` | `df05658c5527a3ef16d045e2e6fb1abec8378e747ce2b26c782de201866219a0` |
| `assets/style-Bbu86IxV.css` | `d94ed827bffbcd867b77f474fdb5d48d28bf990c8431d7d4c76a437957a31d08` |
| `sw.js` | `6cb0e337c93d2b7a33cbf28f8052f0e30ba462d61123d45a3256411e43d9bb78` |

The service-worker cache also contains the candidate prefix. Confirmed that
the tested live deployment is candidate `5c14d998…`.

## Scope and findings

This is a static, local-first product with no product-owned backend, database,
sign-in flow, or distributable library/CLI interface. Therefore backend
concurrency, server persistence, identity-provider, health endpoint, and clean
consumer package checks do not apply. The brief does not call for a model-based
feature, and the complete workflow does not need one.

**Findings: none.**
