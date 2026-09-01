# Collection Batch Desk — repair 6 handoff

## Status: deployed and verified

Repair commit `5fa722e7ce272830cc12d619868a36c298865aa4`
(`fix: repair release-blocking QA findings`) repairs every release-blocking
finding in independent verification 6 while keeping the Vite + vanilla
TypeScript static PWA and `dist/` Azure Static Web Apps artifact.

## What changed

- The cold 390 × 844 landing page now places **Try it with sample data** at
  y=326.28 px (46.78 px tall), entirely inside the first viewport. It opens
  the same 32-item isolated demo in one click.
- `.factory/claims.json` now contains 19 public product claims. Each has one
  exact `@claim:<id>` Playwright regression. The manifest includes CSV mapping
  and parsing, ID validation, thumbnail matching, filtering, source-row
  safety, free core workflow, no-tracking, and Desk Plus restore/daily-check
  behavior in addition to the existing export, demo, privacy, and offline
  claims.
- A verified Desk Plus catalog is persisted when the review desk opens, before
  its first edit. The regression mocks a verified license, reloads, and
  restores the opened desk.
- Added route metadata, canonical URLs, OG/Twitter metadata, a 1200 × 630
  social preview, SVG favicon plus Apple touch icon, demo-specific title,
  product-styled `/404.html`, Static Web Apps 404 override, shared headers,
  shared footer build ID, and legal-page skip links.
- Demo controls and the remote-thumbnail switch meet the 44 px target rule.
  The selected 1,000-row mobile toolbar wraps inside a 390 px viewport.
- The visual thesis records the original-art derivatives used for social and
  Apple icons in `.factory/design.md`.

## Verification

Fresh validation after `npm ci`:

- `npm test`: PASS — 7 Vitest tests and 44 Chromium Playwright tests.
- Each exact command in `.factory/claims.json`: PASS — 19 claim tests.
- `npm run build`: PASS — strict TypeScript check, Vite production build, and
  service-worker generation. Output is `dist/` with `index.html` at its root.
- `npm audit --omit=dev`: PASS — 0 vulnerabilities. There is no separate lint
  script; `tsc --noEmit` is part of the production build.
- Playwright Axe scans (desktop/mobile, dark/light, demo, privacy, terms) and
  a fresh live 390 px Axe sweep: zero serious or critical violations.
- Keyboard regression covers the skip link, Enter sample activation, mobile
  menu, Space item selection/focus restoration, transparent file-input focus,
  and Escape drawer return.
- Local URL verification: title, `lang=en`, one h1, `main`, image alt text,
  labeled buttons, and zero console/page errors. Evidence:
  `.factory/evidence/repair-6-local/verify.json`.
- Local Lighthouse mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.97 s, LCP 1.52 s, TBT 0 ms, CLS 0. Evidence:
  `.factory/evidence/repair-6-local/lighthouse.json`.
- Production bundle: JS 38,975 B / 12.78 kB gzip, CSS 21,001 B / 5.51 kB
  gzip. The responsive hero and no external fonts keep the static budgets
  within limits.

## Deployment and live identity

`dist/` was deployed to the allowed production target
`sf-collection-bulk-curator` with the Azure Static Web Apps CLI on 2026-09-01
UTC. The live URL is <https://collection-bulk-curator.sociobot.in>.

- Live `/` SHA-256 matches `dist/index.html`:
  `cdd79ea659919f612782ff3e83ca440ecd2a67b5c01854aadd170b9b5713f71a`.
- Live `sw.js` matches `dist/sw.js`:
  `5b1e20aef30a1a6f0b4763acb194db0815b98840738db6255e88f906e9b3e664`.
  Its cache is `collection-batch-desk-r5fa722e7ce27-b1117a4af5be`, so
  returning PWA clients receive a new cache version.
- Live social and Apple assets byte-match the production build. Hash evidence,
  headers, local/live URL checks, and screenshots are in
  `.factory/evidence/repair-6-local/` and `.factory/evidence/repair-6-live/`.
- Live `/privacy/`, `/terms/`, and `/404.html` return 200. An unknown route
  returns the product-styled page with HTTP 404. Live HTML includes the
  configured self-only scripts, restricted `connect-src`, `frame-ancestors
  'none'`, `nosniff`, strict-origin referrer policy, permissions policy, and
  immutable hashed asset caching.
- A fresh live 390 px browser confirmed the sample action is fully visible,
  the document is 390 px wide, metadata is present, the demo title is specific,
  and the action opens 32 sample cards.

## Run and deploy

```sh
npm ci
npm test
npm run build
```

Deploy `dist/` to the product's Azure Static Web Apps target. The repository
does not include deployment credentials.

## Known gaps and next steps

None known. This is a static browser product, so package-consumer,
server-concurrency, database, and backend health checks do not apply.
