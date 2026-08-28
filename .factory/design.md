# Collection Batch Desk — visual thesis

## Direction: the surveyor's field desk

Collection Batch Desk borrows from topographic cartography because the product's job is the same kind of careful work: orient within a large territory, mark a precise region, then issue a reversible field instruction. Fine contour lines explain scope and filtering; numbered coordinate labels reinforce retained row identity; vermilion survey marks call attention to the one action that changes the export. It deliberately avoids the interchangeable card-grid dashboard look.

The public/import state feels like an unfolded map on a field table. Once a catalog is loaded, decoration recedes and the workspace becomes a compact three-part survey: filters, item territory, and a change ledger.

## Palette

Light treatment:

- `paper #F4F0E6` — warm map stock, page background.
- `paper-raised #FFFCF4` — working surfaces.
- `ink #18332D` — deep pine drafting ink; 11.5:1 on paper.
- `ink-muted #52645E` — annotation ink; 5.5:1 on paper.
- `contour #B7C1B5` — quiet map lines and rules, never body text.
- `moss #2D5A46` — primary control and selected territory; white has 7.7:1.
- `signal #B33A27` — vermilion survey flag for staged changes and warnings; white has 5.7:1.
- `ochre #8A6116` — caution marker, paired with icons and copy.
- `success #286449`, `danger #9D2D23`.

Dark treatment follows the same material logic as a night field map: `#13201D` ground, `#1C2B27` surface, `#F3EFE5` ink, `#B8C9C0` muted, `#70B58D` accent, `#FF8B74` signal. Every semantic state has a label or icon as well as color.

## Type

- Headings and landmark numerals: Georgia, Cambria, serif — a restrained reference to printed gazetteers, no external font request.
- Interface and data: ui-sans-serif/system stack. It stays legible in dense tables and avoids a font payload.
- Scale: 12 / 14 / 16 / 20 / 28 / clamp(36–58) px. Body is 16 px minimum. IDs and counts use tabular figures.

## Spacing and form

An 8 px base rhythm with 4 px optical adjustments. Controls are at least 44 px high. Corners use 2–10 px radii rather than generic pills; clipped map-tab corners and dashed survey rules make independent regions distinct. Desktop workspace uses a 240 px filter rail, fluid item field, and 304 px ledger. At 390 px, rails become in-flow drawers and the action ledger becomes a bottom sheet only when opened; the item list is the preserved primary context.

## Interaction grammar

- Import = establish the map boundary.
- Filter = narrow the surveyed territory without changing data.
- Select = place reversible survey pins.
- Stage = write proposed changes into the ledger; the source rows remain untouched.
- Export = issue two documents: the forward patch CSV and an undo manifest containing original values.
- Destructive row deletion is intentionally absent in v1. The only local destructive action, clearing a session, names its scope and requires confirmation.

Selection offers “visible results” explicitly; no hidden rows are silently selected. A sticky selection bar shows the exact item count. All staged fields can be removed individually or undone as one most-recent batch.

## Motion

Controls respond in 150 ms. The ledger enters from its physical edge over 220 ms and staged item markers settle with a short opacity/translate change. There are no looping animations. With `prefers-reduced-motion: reduce`, transforms and smooth scrolling are disabled and state changes are immediate. Depth remains through borders, background value, and overlap.

## Original asset plan and provenance

One raster illustration, `public/assets/survey-desk.webp`, anchors the empty/import state: an oblique field-map still life whose blank specimen cards, contour paths, and removable red flags explain visual, reversible batch curation. It contains no interface screenshot, brand, person, or capability the product does not have. Interface icons and contour motifs are hand-authored SVG/CSS.

Prompt sheet:

> Use case: stylized-concept. Asset type: responsive landing/import illustration. Primary request: an editorial top-down still life of a collector's batch-curation survey desk, showing an unfolded cream topographic map with delicate forest-green contour lines, a tidy grid of blank archival specimen cards with small neutral object silhouettes, several removable vermilion survey flags, and a paper change ledger with simple non-legible marks. Scene/backdrop: dark pine-green field table. Style/medium: tactile cut-paper relief and screen-printed editorial illustration, subtle paper fibers, precise handcrafted edges. Composition/framing: landscape 3:2, map and cards clustered to the right with calm negative space at upper left, no cropped important objects. Lighting/mood: soft raking afternoon light, quiet, careful, trustworthy. Color palette: warm parchment, deep pine ink, muted moss, mineral gray, sparse vermilion. Materials/textures: uncoated paper, wood, brass pin heads. Constraints: abstract object silhouettes only; no people; no readable text; no UI; no logos; no watermark; no brands; no gradients; no neon; no glossy 3D; no photographic clutter.

Generation: Azure AI Foundry factory image deployment through `/opt/fleet/lib/gen-image.sh`, 2026-08-28. The generated image is original to this product; prompt is also stored beside the source asset. It is disclosed as AI-generated in the footer.

## Accessibility and performance

Both color treatments target WCAG AA. Focus is a 3 px ochre/cream double ring, not color change alone. The illustration has fixed dimensions, a concise alt, AVIF/WebP sources, and a PNG source retained only under `assets/src/`. Mobile uses the smaller responsive derivative; all shipped hero formats remain below 300 KB. The application uses no web fonts or runtime dependencies.
