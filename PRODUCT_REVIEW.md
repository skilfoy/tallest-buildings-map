# Current functionality and next-gen roadmap (2026-05-19)

## Current functionality

### 1) Dashboard filtering and ranking
- The app renders a dashboard title/subtitle and an interactive filter bar.
- Users can:
  - Search by building/city/country keyword.
  - Filter by status (`all`, `completed`, `topped-out`, `under-construction`).
  - Set minimum height via range slider.
- Filtered results are sorted by `heightM` descending and shown in a ranked table.
- CSV export downloads exactly the currently filtered rows.

### 2) Interactive map
- A `react-leaflet` world map is rendered with OpenStreetMap tiles.
- Each filtered building is shown as a marker.
- Clicking a marker shows popup details (name, location, height, floors, year).

### 3) Data model and current data source
- Data is currently local static TypeScript array data (`src/data/buildings.ts`).
- Type safety exists for the building schema and status union.

### 4) Export utilities
- CSV generation includes proper double-quote escaping.
- File download is browser-native via `Blob` + temporary anchor link.

## Product strengths today
- Good baseline architecture (clear split between UI/map/data/utils).
- Fast local filtering with memoization.
- Useful map + table + export triad for exploration workflows.
- Minimal operational complexity (no backend required).

## Gaps and risks
- Data is static and can become stale.
- No pagination/virtualization for large datasets.
- No automated tests for filter logic and CSV correctness.
- No analytics panels (trends, deltas, per-country summaries).
- No URL-state deep-linking for shared filtered views.
- No explicit loading/error states for future remote data mode.

## Suggested improvements (near-term)

### Engineering quality
1. Add tests:
   - `toCsv` quoting edge cases.
   - filter combinations and sort stability.
2. Add lint and CI gates (`build`, `test`, `lint`).
3. Add stronger typing for optional/null fields and validation guards.

### UX
1. Add sortable table columns and sticky header.
2. Add quick filter chips (Top 10, 500m+, USA, China, completed only).
3. Add empty-state guidance and filter reset control.
4. Add accessible labels/ARIA and keyboard shortcuts.

### Data
1. Introduce a pluggable data adapter layer:
   - static local adapter (current)
   - remote API adapter (future)
2. Add freshness metadata (`source`, `updatedAt`, `version`).
3. Add caching policy with stale-while-revalidate behavior.

## Innovative advancements (mid/long-term)

1. "Time-travel skyline" mode:
   - timeline slider to animate skyscraper growth by completion year.
2. Scenario forecasting:
   - compare projected skyline rankings using under-construction pipeline.
3. AI insight copilot (grounded):
   - natural language queries over dataset ("show fastest-growing countries since 2010").
4. Geo-analytics overlays:
   - density heatmaps, regional growth choropleths, and clustering at zoom levels.
5. Comparative cards:
   - select 2–5 buildings and compare metrics side-by-side.
6. Shareable intelligence:
   - permalinked views, exportable chart images, and embeddable map snapshots.
7. Data quality observability:
   - anomaly detector for impossible values and duplicate entities.

## Recommended implementation sequence
1. Test + CI hardening.
2. URL state + better table controls.
3. Data adapter abstraction + source metadata.
4. Analytics panels and charting.
5. Time-travel mode + AI query layer.
