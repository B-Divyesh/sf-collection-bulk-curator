# Collection Batch Desk — build handoff

## Shipped

- A complete local-first CSV workflow: file/drop import, robust quoted/multiline CSV parsing, explicit source-column mapping, and safety rejection for blank or duplicate IDs.
- A responsive review desk with title/ID/tag search; collection, location, condition, and changed-state filters; visible-only bulk selection; local thumbnail matching; and opt-in-only remote thumbnails.
- Reversible staging for tags (set/add/remove/clear), location, condition, and collection. The source rows are immutable, staged values remain visible in context, the last batch can be undone, and per-row staged changes can be removed.
- Patch CSV and undo-manifest CSV exports. Both retain the mapped ID heading and IDs verbatim, including leading zeroes.
- Topographic field-desk identity in `.factory/design.md`, light/dark treatments, responsive 390 px layout, reduced-motion behavior, keyboard-operable mobile rails, and an original generated hero in responsive AVIF/WebP formats.
- Offline-capable app shell, explicit offline status, no analytics or third-party runtime assets, local-only Desk Plus workspace recovery, and opt-in billing license verification per the Sociobot contract.
- Privacy and terms pages, MIT license, Azure Static Web Apps security/cache configuration, robots and sitemap files, and full project documentation.

## Run and verify

```sh
npm install
npm test
npm run build
```

Deploy command: `npm run build`  
Deploy directory: `dist/` (`dist/index.html` is present)

Final local verification on 2026-08-28:

- `npm test`: 2 unit tests and 5 Chromium end-to-end tests passed.
- End-to-end coverage: complete stage/undo/export flow, malformed/duplicate-ID safety, import/mapping/workspace accessibility in both themes, legal pages, and 390 px filter/ledger access.
- Axe: zero serious or critical violations on tested product states and both legal pages.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, no console/page errors, title/lang/main present, exactly one `h1`, zero images missing alt, zero unlabeled buttons; 549 ms local load.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 20 ms, CLS 0, interactive 1.5 s.
- Production bundles: JS 32.28 KB / 11.11 KB gzip; CSS 18.35 KB / 5.11 KB gzip. Hero: 18 KB mobile AVIF, 33 KB mobile WebP, 82 KB desktop AVIF, 126 KB desktop WebP.
- Verification output is retained in `.factory/evidence/`.

## Release note

The staging build defaults to `https://pilot-api.sociobot.in/api/v1`. Set `VITE_BILLING_API_BASE=https://api.sociobot.in/api/v1` for the registered live product at release. The product slug is used, never a hardcoded billing product ID.

## Known gaps and next steps

- Plus workspace recovery intentionally does not persist local image blobs; users reattach thumbnail files after restoring a session. This prevents hidden duplication of personal images in browser storage.
- The product exports platform-neutral CSV patches; applying them remains a reviewed manual step because direct account automation is explicitly out of scope.
- Validate the factory-registered test checkout and return URL after product registration; the UI and verify/cache/restore-token paths are implemented, but no product is registered from this repository.
