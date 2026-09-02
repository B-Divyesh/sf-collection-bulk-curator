# Collection Batch Desk

Stage bulk catalog edits before export. For collectors with many physical items, import a CSV, review a filtered subset, then export a patch and an undo CSV.

The desk maps CSV headings, optionally matches local thumbnails by filename, filters visible records, and stages export-only changes. It exports a patch CSV and a separate undo CSV with original values. Blank and duplicate IDs are blocked. IDs such as `0007` remain strings throughout.

## Product boundaries

- Catalog data stays in the browser by default.
- Remote thumbnails stay off until explicitly enabled.
- Core import, filtering, staging, undo, and export are free. Desk Plus is a $19 one-time license for automatic local workspace restore.

## Try the demo

Open [`/?demo=1`](https://collection-bulk-curator.sociobot.in/?demo=1) or select **Try it with sample data** on the first screen. It opens a 32-item catalog directly in the review desk. Demo state uses the `demo:collection-bulk-curator:session` browser-storage namespace and never reads or overwrites a real Desk Plus session. Use **Reset demo** to start the sample again or **Start for real** to discard it and import a CSV.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use **Try it with sample data** for a complete no-file walkthrough, or open `/?demo=1` directly.

## Test and build

Playwright `1.58.2` is pinned. The factory image includes its Chromium binary at `$PLAYWRIGHT_BROWSERS_PATH`; elsewhere run `npx playwright install chromium` once.

```sh
npm test
npm run build
```

Claim checks are listed in [`.factory/claims.json`](.factory/claims.json). Each command can be run by appending its grep tag, for example `npm test -- --grep @claim:patch-csv`.

The exact deploy command is `npm run build`. It produces `dist/index.html`, `/privacy/`, `/terms/`, and a product-styled `404.html`. Deploy the contents of `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` supplies security, cache, and 404 response settings.

## CSV behavior

CSV parsing supports UTF-8 BOMs, quoted commas, escaped quotes, and multiline fields. Map your ID and optional title, thumbnail, tags, location, condition, and collection headings before opening the desk. Thumbnails may be attached as local image files and are matched against the mapped filename on desktop or mobile.

Patch and undo exports contain the mapped ID heading and every changed field.

## Privacy and licensing

The app has no analytics, ads, remote fonts, or third-party scripts. The app stores your theme choice. It can store an optional license token and verification result. Desk Plus can save a workspace. Demo data is separate and can be reset. Checkout and license verification use the Sociobot billing API. A staging build can set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1`.

The source is MIT licensed. The generated illustration provenance and full visual specification are in [`.factory/design.md`](.factory/design.md).
