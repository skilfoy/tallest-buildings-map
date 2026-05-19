# Tallest Buildings Map

Interactive React + Vite dashboard that maps and filters the top 100 tallest buildings in the world using OpenStreetMap tiles and city-level clustering.

## What the app renders

The app renders a single-page analytics dashboard with:

- A world tile map (`zoom=2`) using OpenStreetMap raster tiles.
- City-cluster markers (one marker per city+country location) sized by both cluster count and local tallest-building height.
- Linked filters (search, country, city, material, primary function, height range, completion year range).
- Summary cards, bar-chart style breakdowns, a selected-cluster details panel, and a map-linked table.
- CSV export of the currently filtered building rows.

Main UI implementation lives in `src/App.tsx`.

## Where building data lives

The project is fully self-contained in the frontend:

- `RAW_DATA` in `src/App.tsx` stores the building dataset as pipe-delimited text.
- `CITY_COORDINATES` in `src/App.tsx` maps `"City, Country"` strings to city-level latitude/longitude.
- `parseBuildings(rawText)` parses `RAW_DATA` into typed row objects and joins coordinates via `CITY_COORDINATES`.

If a location key is missing from `CITY_COORDINATES`, the parser currently falls back to `[0, 0]`, which places the point near the Gulf of Guinea.

## How clustering and projection are computed

### Projection

`projectMercator(lat, lon, zoom)` in `src/App.tsx` converts latitude/longitude to pixel coordinates in Web Mercator space:

- Tile constants:
  - `TILE_ZOOM = 2`
  - `TILE_SIZE = 256`
  - `WORLD_SIZE = TILE_SIZE * 2^TILE_ZOOM` (1024px)
- Formula (implemented directly):
  - `x = ((lon + 180) / 360) * scale`
  - `y = (0.5 - ln((1 + sin(lat)) / (1 - sin(lat))) / (4π)) * scale`

These projected `x/y` values are used to absolutely position marker buttons on top of the map tile container.

### Clustering

`groupByCity(rows)` in `src/App.tsx` clusters by `row.location` (`"City, Country"`):

- Each unique location becomes one group with:
  - shared lat/lon
  - projected x/y
  - `buildings[]`
  - `count`
  - `tallest` (max `heightM` within group)
- Groups are sorted by descending `tallest.heightM`.

Marker radius is calculated at render time in `TileWorldMap` from:

- cluster count
- tallest building height in the cluster
- clamped min/max radius for visual consistency

## Local development and build

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production assets:

```bash
npm run build
```

Preview local production build:

```bash
npm run preview
```

## GitHub Pages deployment notes

This repo is configured for GitHub Pages project-site hosting under:

- `https://<your-user>.github.io/tallest-buildings-map/`

`vite.config.ts` already sets:

```ts
base: "/tallest-buildings-map/"
```

That base path is required so built asset URLs resolve correctly under the project subpath.

Typical Pages flow:

1. Build with `npm run build`.
2. Publish the generated `dist/` directory to your Pages target branch/folder (for example via a GitHub Actions deploy workflow).
3. Confirm repository Pages settings point to the published artifact/branch.

## Editing data and filters (quick guide)

When you want to update dataset contents or filter behavior, these are the primary modules/identifiers:

- Data source and parsing (`src/App.tsx`):
  - `RAW_DATA`
  - `CITY_COORDINATES`
  - `parseBuildings`
- Filtering state (`src/App.tsx`):
  - `query`, `country`, `city`, `material`, `primaryFunction`
  - `minHeight`, `maxHeight`, `minYear`, `maxYear`
- Filter logic (`src/App.tsx`):
  - `filtered` (`useMemo`) where all predicates are combined
- Option lists (`src/App.tsx`):
  - `countryOptions`, `cityOptions`, `materialOptions`, `functionOptions`
- Reset behavior (`src/App.tsx`):
  - `resetFilters`

### Common edit examples

- Add a new building row: append a line to `RAW_DATA` and ensure city-country coordinates exist in `CITY_COORDINATES`.
- Add a new city coordinate: add key `"City, Country": [lat, lon]` to `CITY_COORDINATES`.
- Change default filter ranges: update initial `useState` values and matching slider min/max attributes.
- Change exported CSV columns: edit `headers` and row mapping in `toCsv`.

## Troubleshooting

### Blank GitHub Pages app after deploy

Check these first:

1. **Incorrect Vite base path**
   - Ensure `vite.config.ts` uses `base: "/tallest-buildings-map/"` for this repository name.
   - If you renamed the repo, update `base` to the new repo path and rebuild.

2. **Built files deployed from wrong folder/branch**
   - Verify Pages is serving the output generated from `dist/`.
   - Make sure the deployment workflow actually uploads the latest build.

3. **Stale cached assets**
   - Hard refresh the browser (or clear site data) after a deploy.

4. **404s for JS/CSS assets**
   - Open browser devtools Network tab and confirm asset URLs include `/tallest-buildings-map/`.
   - A missing subpath in asset URLs usually means base-path mismatch.

### Map appears but markers are wrong/missing

- Ensure each `RAW_DATA` location string matches the `CITY_COORDINATES` key format exactly (`"City, Country"`).
- Mismatches fall back to `[0, 0]`, which can look like missing or incorrectly clustered points.

### Map tiles fail to load

- The map uses live tile URLs from `https://tile.openstreetmap.org/`.
- If tiles are blank, check network access/content blockers and browser console for blocked requests.
