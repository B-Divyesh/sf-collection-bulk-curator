# Collection Batch Desk demo

## Entry point

Open `/?demo=1` or select **Try it with sample data** on the landing page.
The demo opens the populated review desk directly. No CSV, account, or setup is
required.

## Sample catalog

The demo contains 32 collector items with zero-padded IDs (`0001`–`0032`),
titles, tags, locations, conditions, and collections. It is large enough to
filter, select, stage a field change, export a patch CSV, export an undo CSV,
and undo the staged batch.

## Isolation and reset

Demo data is stored only under the browser-storage key
`demo:collection-bulk-curator:session`. It never reads or writes the real
Desk Plus key, `collection-bulk-curator:session`. The persistent banner offers
**Reset demo**, which restores the original 32-item catalog, and **Start for
real**, which discards the demo namespace and returns to CSV import.

The exact browser regression tests are listed in `.factory/claims.json`.
