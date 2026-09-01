# Collection Batch Desk — review 2 handoff

## Status: FAIL

This was an independent, read-only adversarial review of production and commit
`7f4dab3305e3f129de07314b5b88ac1106ac8103`. No product code was changed.

## What was done

- Reviewed the live site cold at 390 × 844 and 1440 × 1000, exercised the
  one-click demo, reset, demo exit, browser history/focus, route metadata,
  privacy request log, accessibility, link crawl, and designed 404.
- Used a new local clone for `npm ci`, `npm test`, every exact claim command
  from `.factory/claims.json`, and `npm run build`; all passed.
- Checked each finding in `review-1.md` and `polish-1.md`; all are fixed on
  the live deployment and in source.

## Remaining work

Review 2 records four minor findings in [review-2.md](./review-2.md):

1. Remove or test the broad “safely” claim.
2. Remove the untested “Secure checkout” claim.
3. Use “undo CSV” rather than “undo manifest” consistently.
4. Mark the GitHub source link as external.

After those changes, rerun the complete review checklist rather than treating
the repair as a copy-only change.
