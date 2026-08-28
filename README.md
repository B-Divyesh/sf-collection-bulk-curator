# Collection Batch Desk

Collection Batch Desk is a private, local-first review layer for physical-collection catalogs. It is for collectors who need to apply the same reviewed tag, location, condition, or collection value across a precise subset without editing hundreds of records one by one.

The desk imports a CSV, lets the user map arbitrary source headings, optionally matches local thumbnail files by filename, filters and selects visible records, and stages changes without modifying the source data. It exports a patch CSV and a separate undo CSV containing the original values. Blank and duplicate IDs are blocked so patches remain unambiguous; source IDs such as `0007` remain strings throughout.

## Product boundaries

- No catalog data is uploaded.
- Remote thumbnail requests are off by default and require an explicit opt-in.
- This tool does not connect to or automate a collection platform.
- Deletion is intentionally excluded. Clearing the local desk is confirmed when edits exist.
- Core import, filtering, staging, undo, and export are free. The $19 one-time Desk Plus license adds automatic local workspace restore.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use “Try a 32-item sample” for a complete no-file walkthrough.

## Test and build

Playwright `1.58.2` is pinned. The factory image includes its Chromium binary at `$PLAYWRIGHT_BROWSERS_PATH`; elsewhere run `npx playwright install chromium` once.

```sh
npm test
npm run build
```

The exact deploy command is `npm run build`. It produces `dist/index.html` plus the `/privacy/` and `/terms/` pages. Deploy the contents of `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` supplies security and immutable asset-cache headers.

## CSV behavior

CSV parsing supports UTF-8 BOMs, quoted commas, escaped quotes, and multiline fields. The first row must contain unique headings. The mapping screen requires a unique non-empty item ID and permits optional title, thumbnail, tags, location, condition, and collection columns. Thumbnails may be attached as multiple local image files and are matched against the mapped image filename.

Patch and undo exports contain the mapped ID heading and every field changed anywhere in the batch. For a row where one of those columns was not changed, its current value is included, making the output rectangular and safe for spreadsheet review.

## Privacy and licensing

The app has no analytics, ads, cookies, remote fonts, or third-party scripts. Local storage holds the theme, an optional license token and daily verification cache, and—only for an active Desk Plus license—the resumable workspace. Checkout and license verification use the Sociobot billing API; no product IDs or payment-provider integrations are embedded. Staging defaults to `https://pilot-api.sociobot.in/api/v1`; release builds set `VITE_BILLING_API_BASE=https://api.sociobot.in/api/v1`.

The source is MIT licensed. The generated illustration provenance and full visual specification are in [`.factory/design.md`](.factory/design.md).
