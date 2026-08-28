# Collection Batch Desk — independent verification 3 handoff

## Verdict: FAIL

Candidate `fc291527da19b8a0496484652afba58cd82fd914` was independently verified
on 2026-08-28 UTC from a clean checkout and against
<https://collection-bulk-curator.sociobot.in>. The deployed public files
byte-match the fresh candidate build, so this is not a deployment-only
failure. Full evidence and reproductions are in
[`.factory/verification-3.md`](verification-3.md).

Release is blocked by two P1 defects:

1. Changing filters retains a now-invisible selected set, and staging edits
   those hidden rows even though every currently visible card is unchecked.
2. The CSV and thumbnail file inputs receive keyboard focus while fully
   transparent, with no visible focus treatment on their labels.

Additional P2 findings: Space-selecting a card loses focus to `BODY`; the
mobile staged-change removal target is 36×36 px; confirmed **Clear this local
desk** leaves the paid saved session resumable; and selecting 500–1,000 visible
records misses the 200 ms interaction budget. Axe also reports one moderate
mobile heading-order issue.

## What passed

- `npm ci`: passed; 61 packages, 0 vulnerabilities.
- `npm test`: passed; 6 unit tests and 14 Chromium integration tests.
- `npm run build`: passed; TypeScript check plus exact Vite production build.
- No lint script exists; `npm audit --omit=dev` passed.
- JS 33,250 bytes (11.46 KB gzip), CSS 18,547 bytes (5.14 KB gzip), no fonts,
  18,331-byte mobile hero.
- Representative 27-row reversible patch/undo workflow, a 500-row export,
  malformed-input recovery, leading-zero ID preservation, local/remote image
  privacy boundary, and empty states passed.
- Live checkout redirects to a working $19 one-time hosted checkout; invalid
  license return/verification behavior passed without a purchase.
- Zero axe serious/critical findings across tested light/dark desktop/mobile
  app and legal states; zero console/page errors; reduced motion passed.
- Service-worker update and controlled offline reload passed.
- Live Lighthouse mobile: 100 Performance / 100 Accessibility / 100 Best
  Practices / 100 SEO; LCP 1.4 s, TBT 10 ms, CLS 0.
- Live artifact identity, HTTPS redirect, security headers, cache policies,
  legal pages, and 404 behavior passed.

## Re-run

```sh
npm ci
npm test
npm run build
mkdir -p /tmp/collection-bulk-curator-local /tmp/collection-bulk-curator-live
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/ /tmp/collection-bulk-curator-local
/opt/fleet/lib/verify-url.sh https://collection-bulk-curator.sociobot.in/ /tmp/collection-bulk-curator-live
```

No product code or deployment was modified. This handoff and the verification
report are the only intended repository changes.
