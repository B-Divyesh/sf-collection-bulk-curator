# Collection Batch Desk — independent verification handoff

## Status: FAIL

Candidate `49724c9cb569ecc0204e6b13af39c0c62a1ff2a9` was independently verified
on 2026-08-28 against
<https://collection-bulk-curator.sociobot.in>. The direct live artifact
byte-matches the candidate and all ordinary functional, accessibility,
privacy, build, and performance checks pass. Release remains blocked because
an installed PWA does not upgrade from the preceding deployed build.

## Release blocker

**P1 — stale PWA clients remain on the old defective JavaScript.** The prior
candidate and this candidate ship byte-identical `public/sw.js` files
(`5d143fad...d16618`) and both use cache
`collection-batch-desk-v3`. In a persistent Chromium profile, the previous
build installed `/assets/index-ULxunsl-.js`. After the same origin was switched
to this candidate, a direct network request returned
`/assets/index-C_bR1aIn.js`, but `registration.update()` plus online reload and
offline reload all continued loading the old JS from Cache Storage. Returning
users can therefore retain the selection-scope and keyboard-focus defects from
the previous release.

Version or otherwise refresh the service worker/cache, deploy the repaired
artifact, and verify an upgrade using a profile first controlled by the old
build. Do not validate only with a fresh browser profile.

## Verification summary

- Clean detached checkout at the exact candidate; `origin/main` matched.
- `npm ci`, `npm audit --omit=dev`, `npm test` (6 unit + 20 browser tests), and
  `npm run build` all passed. No separate lint script exists.
- Independent local and live desktop/390 px workflows passed, including
  malformed-input recovery, arbitrary mapping, verbatim leading-zero IDs,
  filter/selection safety, 32+ changes, exact patch/undo contents, keyboard
  focus, mobile drawers, local thumbnails, remote-image opt-in, and reduced
  motion.
- Axe found zero serious/critical findings across import light/dark, mapping,
  workspace, mobile ledger, privacy, and terms. Browser console/page errors:
  zero.
- No analytics, cookies, catalog upload, remote fonts, or third-party runtime
  scripts were observed. Free work did not persist catalog data.
- Production checkout redirects to Dodo; real invalid-license verification
  behaved correctly and returned restrictive CORS/cache policy.
- All deployed files byte-match `dist/`; HTTPS redirect, CSP/security headers,
  404 behavior, HTML revalidation, immutable asset caching, and `sw.js`
  `no-cache` were confirmed.
- Budgets pass: 35,002-byte JS (11,868 gzip), 18,790-byte CSS (5,193 gzip), no
  fonts, 18,331-byte mobile AVIF. Lighthouse mobile scores were 100/100/100/100
  with LCP 1,423.5 ms, TBT 18.5 ms, and CLS 0.

Full evidence and exact reproduction are in
[`verification-4.md`](verification-4.md). No product code was changed during
verification.
