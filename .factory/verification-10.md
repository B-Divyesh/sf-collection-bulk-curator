# Independent verification 10 — PASS

- **Work order:** `collection-bulk-curator-verify-10`
- **Candidate:** `d2afd9e9bbcd005e9be8bb52a2252393f276b505`
- **Live URL:** <https://collection-bulk-curator.sociobot.in>
- **Checked:** 2026-09-01 UTC

## Release result

**PASS.** The candidate meets the researched brief and static-web product
contract. No blocker, major, or minor defect was found. The deployed JS, CSS,
and service worker are byte-identical to the production build from this commit.

## Cold first read and demo

**PASS.** A fresh desktop browser loaded the live page with no cache. The first
screen says **“Stage bulk catalog edits safely”**, identifies **collectors
updating a chosen subset without losing the original catalog**, and gives a
plain first action: **“Try it with sample data”** followed by **“Loads 32
sample items in the review desk.”** This answers what it does, who it is for,
and what to click first in plain words.

At 390 x 844, the action remains in the opening viewport. One activation (and
the direct `/?demo=1` entry) opened 32 item cards, retained exact zero-padded
IDs, and showed the persistent **“Demo — sample data, nothing is saved”**
banner with **Reset demo** and **Start for real**. The mobile screenshot and
layout check found no horizontal overflow.

## Mandatory claims gate

**PASS — 20/20.** From the clean clone I ran `npm ci`, then ran every declared
claim selection in `.factory/claims.json` through its exact `@claim:<id>`
Playwright selector (combined into one equivalent selector invocation). Vitest
completed 7/7 checks and Playwright completed all 20 selected claim checks;
`test-results/.last-run.json` reported `passed` with no failed tests.

| Claim IDs | Result | Observable evidence |
| --- | --- | --- |
| `sample-catalog`, `demo-isolation`, `offline-reload` | PASS | One-click 32-item sandbox, isolated storage, and dedicated-context offline reload work. |
| `local-data`, `no-tracking`, `remote-thumbnails` | PASS | Demo traffic stayed same-origin with no cookies; remote imagery waits for opt-in. |
| `exact-ids`, `patch-csv`, `undo-manifest`, `source-rows-unchanged` | PASS | Live independent export yielded `ID,Location` and `0001,Archive room`; undo preserved the original value. |
| `csv-heading-mapping`, `csv-format-support`, `id-validation`, `local-thumbnail-matching` | PASS | Mapping/recovery paths and local thumbnail matching are covered by the selected browser tests. Live duplicate-ID recovery said exactly what to fix; a nonstandard mapping opened `Small vessel`. |
| `filter-visible-results`, `free-core-workflow` | PASS | Selected browser tests passed; staging/export remains usable without a license. |
| `desk-plus-price`, `desk-plus-session`, `daily-license-check`, `license-request-boundary` | PASS | Selected browser tests passed for $19 pricing, local restore, daily verification cache, and a token-only GET. |

I reviewed the live landing copy, README, legal copy, and demo guide against
the claims manifest. No unlisted visitor-facing promise was found.

## Local quality gates

- `npm ci`: PASS — 61 packages installed; audit reported 0 vulnerabilities.
- `npm test`: PASS — 7 Vitest checks and 48 Chromium checks.
- `npm run build`: PASS — strict TypeScript, Vite production build, and
  service-worker generation completed; `dist/` exists.
- No separate lint command or lint configuration is present; type checking is
  part of the build.
- Initial JS is 39,082 bytes / 12,830 bytes gzip; CSS is 21,261 bytes / 5,520
  bytes gzip. Both are well within the static-product budgets.

## End-to-end, privacy, deployment, and rate limiting

The live demo independently selected an item, staged a location change, and
downloaded an exact patch CSV containing `0001,Archive room`. A duplicate-ID
upload was stopped with: **“Duplicate ID ‘001’ would make a patch ambiguous.
Make IDs unique first.”** A nonstandard CSV mapping then recovered cleanly and
opened the review desk with its `Small vessel` item.

The complete live demo request log contained only this origin (HTML, local
AVIF, JS, CSS, and first-party legal pages); it made no third-party request and
the cookie jar was empty. A populated demo reloaded offline under service
worker control and retained its heading, banner, and **“Offline · local tools
still work”** status without console or page errors. The static app has no
product-owned server endpoint. Its documented Sociobot product verification
endpoint was exercised with an invalid synthetic license: requests 1–30
returned 200; request 31 returned **429** with **`Retry-After: 4`**. The
observed allowance is therefore 30 requests per current window.

The production files match this candidate exactly:

- `assets/index-iXADokwZ.js`: SHA-256
  `5ee27901f898c7a321bb8ae2b7c2cc8799bc02278c6602dcdacdaffbdd123495`
  locally and live.
- `assets/style-tfuvWpD-.css`: SHA-256
  `908c96d139d9c2594d8c8897a44e3c533e8ec7c563452afa97124fb9969cec4a`
  locally and live.
- `sw.js`: SHA-256
  `055ce381dbc19deddc96cfe3685cc14cb90894d0eca97ded6ea16ed63c04ce76`
  locally and live; its cache is `collection-batch-desk-rd2afd9e9bbcd-507dfc645b15`.

## Accessibility, routing, headers, and performance

- Axe had zero serious/critical findings on live `/`, `/?demo=1`, `/privacy/`,
  and `/terms/`.
- Keyboard smoke test passed: Skip to workspace was first, showed a visible
  3 px ochre focus outline, and Enter moved focus into `main`. The local
  browser suite also covers keyboard selection, mobile panel focus, Escape,
  focus restoration, touch targets, and 200% text reflow.
- At 390 px, the demo banner and filter panel were usable without horizontal
  overflow. Reduced-motion mode reduced item transition duration to `0.00001s`.
- `/`, `/privacy/`, `/terms/`, `/404.html`, `robots.txt`, and `sitemap.xml`
  return 200; an unknown route returns the styled 404 with status 404. Each
  required page has `lang=en`, a title, one h1, a main landmark, and image alt
  text.
- Response headers include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, CSP with `frame-ancestors 'none'`,
  one-year immutable caching for hashed assets, and `no-cache` for `sw.js`.
- Lighthouse 12.8.2 mobile: **100 Performance**, **100 Accessibility**;
  LCP **1.4 s**, CLS **0**.

## Defects by severity

- **Blocker:** none.
- **Major:** none.
- **Minor:** none.

## Known gaps / next steps

None for this candidate. No code changes were made during verification.
