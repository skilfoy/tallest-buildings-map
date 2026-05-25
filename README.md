# Tallest Buildings Intelligence Map

Public-facing React + TypeScript + MapLibre dashboard for tallest-building intelligence.

## Data lifecycle
- Snapshot-first: `public/snapshot.json` renders immediately at startup.
- Browser cache: validated localStorage cache with 24h TTL may promote to active data.
- Live refresh: `Reload live` fetches public data and promotes only if validation passes.
- Failed/rejected live refresh never replaces a working dataset.

## Validation gates
Promotion requires:
- >= 50 valid records
- Valid id/name/country/height/lat/lon fields
- Height range 200m..1000m
- Anchor records: Burj Khalifa, Merdeka 118, Shanghai Tower

## Map behavior
- Native MapLibre GeoJSON clustering (`cluster`, `clusterRadius`, `clusterMaxZoom`)
- Cluster click zoom expansion + leaf selection
- Point click selects building and opens details popup
- Table row click focuses map and selects building

## Privacy note
Cache is stored only in the viewer's browser via localStorage.
No browser cache data is written to GitHub.

## Scripts
- `npm run dev`
- `npm run build`
- `npm test`
