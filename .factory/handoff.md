# Collection Batch Desk — review 1 handoff

## Status: FAIL

This was a reviewer-only work order. No product source, deployment,
infrastructure, configuration, secrets, or external resources were changed.
The review artifacts identify three minor acceptance findings in
[`review-1.md`](./review-1.md): route-change focus targets `main` rather than
the current h1; visitor-facing fieldwork metaphors remain; and one README
sentence exceeds the 22-word limit.

## Verification completed

- Fresh `npm ci` completed successfully.
- `npm run build` passed and produced `dist/`.
- Every declared claim test in `.factory/claims.json` passed, run in two
  `npm test -- --grep` groups covering all 20 `@claim:` identifiers.
- Live cold desktop and 390 px visits, direct demo, reset, demo isolation,
  same-origin request logs, 404, route navigation, metadata, and links were
  checked.
- `/opt/fleet/lib/verify-url.sh` passed for the live landing route. Live Axe
  checks found no serious or critical violations on landing, demo, Privacy, or
  Terms.

## Next steps

Implement the three concrete fixes in `review-1.md`, add a route-change h1
focus regression test, then request a fresh independent review. The working
tree is buildable; this commit contains documentation only.
