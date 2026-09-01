# Copy audit

Audited 2026-09-01 for release 1.0.2. Counts treat hyphenated terms and `$19`
as one word. Fragments are marked as such. No visitor-facing sentence exceeds
22 words, and no banned plain-words term remains.

## Header, demo banner, license panel, and footer

| Copy | Words | Result |
| --- | ---: | --- |
| Review catalog changes before export | 5 | Pass; literal header subtitle. |
| Demo — sample data, nothing is saved | 7 | Pass. |
| The sample stays separate from your real desk. | 8 | Pass. |
| One-time license | 2 | Pass; literal panel heading fragment. |
| Desk Plus · $19 | 3 | Pass; offer heading fragment. |
| Automatically save and restore your local workspace next visit. | 9 | Pass. |
| Core review, undo, and both exports stay free. | 8 | Pass. |
| License verified on this device. | 5 | Pass. |
| Secure checkout by Sociobot / Dodo. | 5 | Pass. |
| Refunds are handled by the merchant of record. | 8 | Pass. |
| Your catalog stays in this browser. | 6 | Pass. |
| Generated catalog review illustration. | 4 | Pass; provenance fragment. |
| Built by Param Factory · v1.0.2 | 6 | Pass; build fragment. |

## Landing first screen and import

| Copy | Words | Result |
| --- | ---: | --- |
| Stage bulk catalog edits safely | 5 | Pass. |
| For collectors updating a chosen subset without losing the original catalog. | 10 | Pass. |
| Try it with sample data | 5 | Pass; action label. |
| Loads 32 sample items in the review desk. | 9 | Pass. |
| Catalog stays in your browser | 5 | Pass; fact fragment. |
| Works offline after first visit | 5 | Pass; fact fragment. |
| $19 once for Desk Plus | 5 | Pass; fact fragment. |
| Illustration of a local catalog review desk. | 7 | Pass. |
| Choose your catalog CSV | 4 | Pass; section heading. |
| Map columns, stage changes, then export a patch CSV and undo CSV. | 12 | Pass. |
| Drop CSV here or browse | 6 | Pass; action label. |
| UTF-8 CSV · first row must be headings | 7 | Pass; requirement fragment. |
| Optional thumbnails | 2 | Pass; heading fragment. |
| Select image files after the CSV. | 6 | Pass. |
| They are matched by filename and stay local. | 8 | Pass. |

## How it works

| Copy | Words | Result |
| --- | ---: | --- |
| Review, stage, and export | 4 | Pass; section heading. |
| Search titles and IDs. | 4 | Pass. |
| Then filter collection, location, or condition. | 7 | Pass. |
| Select visible items. | 3 | Pass. |
| Stage one field at a time. | 6 | Pass. |
| Source rows stay unchanged. | 4 | Pass. |
| Export a patch CSV and an undo CSV with the original values. | 13 | Pass. |

## Recovery copy changed in this release

| Copy | Words | Result |
| --- | ---: | --- |
| That CSV is over 15 MB. | 6 | Pass. |
| Split the CSV into smaller files. | 7 | Pass; literal recovery step. |
| The CSV has headings but no item rows. | 8 | Pass. |
| The CSV could not be read. | 6 | Pass. |
| Choose the column that contains item IDs. | 7 | Pass. |
| Fill them in before safe patching. | 6 | Pass. |
| Make IDs unique first. | 4 | Pass. |

## README sentence repaired in this release

| Copy | Words | Result |
| --- | ---: | --- |
| The app stores your theme choice. | 6 | Pass. |
| It can store an optional license token and verification result. | 10 | Pass. |
| Desk Plus can save a workspace. | 6 | Pass. |
| Demo data is separate and can be reset. | 8 | Pass. |

## Terminology

| Concept | Term used |
| --- | --- |
| User’s source file | catalog CSV |
| Proposed output for applying edits | patch CSV |
| Output containing original values | undo CSV |
| Proposed edit not yet exported | staged change |
| Isolated sample workspace | demo |
| Paid restore feature | Desk Plus |

The obsolete phrases “reversible catalog fieldwork,” “one-time field kit,” and
“smaller fieldwork batches” were removed. The decorative coordinate label was
also removed because it gave visitors no task information.
