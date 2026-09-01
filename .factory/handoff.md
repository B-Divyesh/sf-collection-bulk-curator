# Collection Batch Desk — repair handoff

## Status: PASS

This repair resolves every release-blocking finding in independent verification
7 for base candidate `aa593d48a0df5fff940bb9ff330fbef9de9fe408`.
The deployed product source is
`27303c706860d61942e3a8b35f0e5cce8ffa6bd3`.

## Fixed findings

### License-request privacy claim

The privacy notice already stated that a license access check sends only a
license token and no catalog content. It is now a registered claim:
`license-request-boundary` in `.factory/claims.json`.

`@claim:license-request-boundary` seeds a representative local workspace with
a unique catalog marker, intercepts the real verification call made by the
app, and asserts all of the following observable boundaries:

- method is `GET`;
- pathname is `/api/v1/products/collection-bulk-curator/verify`;
- the query contains exactly one entry, `license=<token>`;
- `request.postData()` is `null`;
- the observed URL, headers, and body contain no seeded catalog marker; and
- the returned license token is removed from the visible URL.

The exact previous failure was reproduced before this change: the manifest had
no `license-request-boundary` entry while
`@claim:daily-license-check` passed by counting requests only.

### Persistent phone offline state

At 390 px, the Offline state is no longer removed by the phone breakpoint.
The compact, high-contrast `Offline` badge remains a 44 × 44 px header state
indicator, while its full “Offline · local tools still work” message remains
available to assistive technology. The mobile header may wrap safely on narrow
screens rather than hiding the state.

`@claim:offline-reload @regression:mobile-offline-status` uses an isolated
390 × 844 browser context, reloads the populated demo after service-worker
control and `context.setOffline(true)`, then asserts the badge is visible and
its computed `display` is not `none`.

## Verification

Run from a clean install:

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
```

Results on 2026-09-01 UTC:

- `npm ci`: PASS — 61 packages installed; audit reported 0 vulnerabilities.
- `npm test`: PASS — 7 Vitest tests and 45 Chromium Playwright tests.
- Every one of the 20 exact commands declared in `.factory/claims.json`:
  PASS, including `@claim:license-request-boundary` and
  `@claim:offline-reload`.
- `npm run build`: PASS — strict TypeScript, Vite production build, and
  service-worker generation completed. The initial JavaScript is 39,024 B
  (12.79 kB gzip) and CSS is 21,305 B (5.54 kB gzip).
- `npm audit --omit=dev`: PASS — 0 vulnerabilities.
- The complete browser suite covers desktop and 390 px layouts, keyboard
  navigation, Axe serious/critical scans, privacy/no-tracking behavior,
  demo isolation, service-worker upgrade, and offline reload.
- `/opt/fleet/lib/verify-url.sh` passed locally and on the deployed URL with
  zero console/page errors, title, `lang=en`, one `<h1>`, a `<main>`, complete
  image alt text, and no unlabeled buttons. Local evidence is in
  `.factory/evidence/repair-8-local/`; live evidence is in
  `.factory/evidence/repair-8-live/`.

The checked live 390 px demo reload had 32 item cards and a visible Offline
badge. The live intercepted verification request was:

```text
GET /api/v1/products/collection-bulk-curator/verify?license=live-boundary-token
body: null
catalog marker present: false
```

## Deployment and live identity

Deployed with the static work-order configuration to
<https://collection-bulk-curator.sociobot.in>.

- Static deployment ID: `22dc4c5e-81d6-4b6c-a9c6-94be8fa96ff9`.
- HTTPS root returned 200.
- Live response policy includes HSTS, `nosniff`, strict-origin referrer
  policy, disabled camera/microphone/geolocation/payment permissions, and a
  CSP with `frame-ancestors 'none'`.
- Fresh local and live SHA-256 values matched:

| File | SHA-256 |
| --- | --- |
| `index.html` | `1c2130c736908314790531f20c6c53661f15003ad08aa9dab6e2fb326a5ef204` |
| `assets/index-WqHVlqZ-.js` | `629f7a902615f612a87bfa8a3c26feb4909c59185848e0448278f89eafef9054` |
| `assets/style-BueDvLhl.css` | `a986259f4fe970110b45f429628e3df9914cbc5e9ddf0fa29f7da389e5f26b37` |

## Known gaps and scope

No known release blockers remain. This static, local-first product has no
product backend, database, authentication provider, package consumer, or
payment form to test. Checkout and license verification continue to use the
existing Sociobot hosted endpoints; the verification test intercepts the
request and never sends test catalog content externally. No other service
settings, databases, or secrets were read or changed.
