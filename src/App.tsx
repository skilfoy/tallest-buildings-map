import { useEffect, useMemo, useState } from "react";
import MapView, { Marker, Popup } from "react-map-gl/maplibre";
import {
  Building2,
  Database,
  Download,
  Filter,
  Globe2,
  MapPin,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";

import type { Building, CityCluster, DashboardFilters, DataEnvelope } from "./data/types";
import { clearBuildingCache, readCachedBuildings, writeCachedBuildings } from "./data/cache";
import { fetchLiveBuildings } from "./data/liveData";
import { applyFilters, clusterByCity, downloadCsv } from "./data/normalize";

const DEFAULT_FILTERS: DashboardFilters = {
  query: "",
  country: "All",
  city: "All",
  minHeight: 0,
  maxHeight: 1000,
  minYear: 1900,
  maxYear: 2030,
};

async function loadSnapshot(): Promise<DataEnvelope> {
  const response = await fetch(`${import.meta.env.BASE_URL}snapshot.json`);
  if (!response.ok) {
    throw new Error("Unable to load snapshot.json");
  }

  return (await response.json()) as DataEnvelope;
}

function statCard(label: string, value: string | number, icon: React.ReactNode, detail: string) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function barList(rows: { label: string; value: number }[]) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex justify-between gap-4 text-xs text-slate-600">
            <span className="truncate">{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-950"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function countBy(items: Building[], key: keyof Building): { label: string; value: number }[] {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const value = String(item[key] ?? "Unknown");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export default function App() {
  const [envelope, setEnvelope] = useState<DataEnvelope | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [status, setStatus] = useState("Loading snapshot...");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredBuildings = useMemo(
    () => applyFilters(buildings, filters),
    [buildings, filters],
  );

  const cityClusters = useMemo(
    () => clusterByCity(filteredBuildings),
    [filteredBuildings],
  );

  const selectedCluster: CityCluster | null =
    cityClusters.find((cluster) => cluster.id === selectedClusterId) ??
    cityClusters[0] ??
    null;

  const countries = useMemo(
    () => ["All", ...Array.from(new Set(buildings.map((building) => building.country))).sort()],
    [buildings],
  );

  const cities = useMemo(() => {
    const scoped =
      filters.country === "All"
        ? buildings
        : buildings.filter((building) => building.country === filters.country);

    return ["All", ...Array.from(new Set(scoped.map((building) => building.city))).sort()];
  }, [buildings, filters.country]);

  const stats = useMemo(() => {
    const averageHeight = filteredBuildings.length
      ? Math.round(
          filteredBuildings.reduce((sum, building) => sum + building.heightM, 0) /
            filteredBuildings.length,
        )
      : 0;

    const tallest = filteredBuildings.length
      ? Math.max(...filteredBuildings.map((building) => building.heightM))
      : 0;

    return {
      buildings: filteredBuildings.length,
      cities: cityClusters.length,
      countries: new Set(filteredBuildings.map((building) => building.country)).size,
      averageHeight,
      tallest,
    };
  }, [filteredBuildings, cityClusters]);

  async function refreshLiveData() {
    setIsRefreshing(true);
    setStatus("Refreshing live data from Wikidata...");

    try {
      const live = await fetchLiveBuildings();
      setEnvelope(live);
      setBuildings(live.buildings);
      writeCachedBuildings(live.buildings);
      setStatus(`Live data loaded at ${new Date(live.fetchedAt).toLocaleString()}`);
    } catch (error) {
      console.error(error);
      setStatus("Live refresh failed. Snapshot or cache remains available.");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    async function boot() {
      try {
        const snapshot = await loadSnapshot();
        setEnvelope(snapshot);
        setBuildings(snapshot.buildings);
        setStatus("Snapshot loaded. Checking cache...");

        const cached = readCachedBuildings();

        if (cached) {
          setEnvelope(cached);
          setBuildings(cached.buildings);
          setStatus(`Using cached live data from ${new Date(cached.fetchedAt).toLocaleString()}`);
          return;
        }

        await refreshLiveData();
      } catch (error) {
        console.error(error);
        setStatus("Initial load failed. Check snapshot.json and network access.");
      }
    }

    boot();
  }, []);

  const center =
    selectedCluster
      ? { latitude: selectedCluster.latitude, longitude: selectedCluster.longitude }
      : { latitude: 20, longitude: 0 };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              Open data intelligence dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
              World's Tallest Buildings
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              A public, snapshot-first, live-refreshing map dashboard built with React,
              TypeScript, MapLibre, Tailwind, Wikidata, and open map tiles.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-950">Data status</p>
            <p>{status}</p>
            <p>Current source: {envelope?.source ?? "loading"}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-5">
          {statCard("Buildings", stats.buildings, <Building2 size={20} />, "Filtered records currently displayed.")}
          {statCard("Cities", stats.cities, <MapPin size={20} />, "City clusters represented on the map.")}
          {statCard("Countries", stats.countries, <Globe2 size={20} />, "Countries in the active result set.")}
          {statCard("Tallest", `${stats.tallest} m`, <Database size={20} />, "Tallest structure in the active view.")}
          {statCard("Average", `${stats.averageHeight} m`, <Database size={20} />, "Mean height across filtered records.")}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter size={17} />
              Filters and data controls
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={refreshLiveData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <RefreshCcw size={16} />
                {isRefreshing ? "Refreshing..." : "Reload live"}
              </button>

              <button
                type="button"
                onClick={() => downloadCsv(filteredBuildings)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Download size={16} />
                Export CSV
              </button>

              <button
                type="button"
                onClick={() => {
                  clearBuildingCache();
                  setStatus("Browser cache cleared. Snapshot remains loaded.");
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Trash2 size={16} />
                Clear cache
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <label className="relative block">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                value={filters.query}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="Search building, city, country, function, material"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>

            <select
              value={filters.country}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  country: event.target.value,
                  city: "All",
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            >
              {countries.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>

            <select
              value={filters.city}
              onChange={(event) =>
                setFilters((current) => ({ ...current, city: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            >
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>

            <input
              type="number"
              value={filters.minHeight}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  minHeight: Number(event.target.value),
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              placeholder="Min height"
            />

            <input
              type="number"
              value={filters.maxHeight}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  maxHeight: Number(event.target.value),
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              placeholder="Max height"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-semibold">Map intelligence layer</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Clusters are grouped by city. Click a marker or table row to inspect the selected cluster.
              </p>
            </div>

            <div className="h-[640px]">
              <MapView
                initialViewState={{
                  latitude: center.latitude,
                  longitude: center.longitude,
                  zoom: 2,
                }}
                latitude={center.latitude}
                longitude={center.longitude}
                zoom={selectedCluster ? 5 : 2}
                mapStyle={{
                  version: 8,
                  sources: {
                    osm: {
                      type: "raster",
                      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                      tileSize: 256,
                      attribution: "© OpenStreetMap contributors",
                    },
                  },
                  layers: [
                    {
                      id: "osm",
                      type: "raster",
                      source: "osm",
                    },
                  ],
                }}
              >
                {cityClusters.map((cluster) => (
                  <Marker
                    key={cluster.id}
                    latitude={cluster.latitude}
                    longitude={cluster.longitude}
                    anchor="center"
                    onClick={(event) => {
                      event.originalEvent.stopPropagation();
                      setSelectedClusterId(cluster.id);
                      setSelectedBuilding(cluster.tallest);
                    }}
                  >
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-sm font-semibold text-white shadow-lg transition hover:scale-110"
                      aria-label={`Select ${cluster.city}, ${cluster.country}`}
                    >
                      {cluster.count}
                    </button>
                  </Marker>
                ))}

                {selectedBuilding && (
                  <Popup
                    latitude={selectedBuilding.latitude}
                    longitude={selectedBuilding.longitude}
                    closeOnClick={false}
                    onClose={() => setSelectedBuilding(null)}
                  >
                    <div className="w-72 p-4">
                      <p className="text-sm font-medium text-slate-500">
                        #{selectedBuilding.rank}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-950">
                        {selectedBuilding.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {selectedBuilding.city}, {selectedBuilding.country}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-800">
                        {selectedBuilding.heightM} m
                      </p>
                    </div>
                  </Popup>
                )}
              </MapView>
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-semibold">Selected cluster</h2>
              {selectedCluster ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-slate-500">Location</p>
                    <p className="font-semibold">
                      {selectedCluster.city}, {selectedCluster.country}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-slate-500">Buildings</p>
                      <p className="font-semibold">{selectedCluster.count}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-slate-500">Tallest</p>
                      <p className="font-semibold">{selectedCluster.tallest.heightM} m</p>
                    </div>
                  </div>
                  <div className="max-h-80 space-y-2 overflow-auto pr-1">
                    {selectedCluster.buildings.map((building) => (
                      <button
                        key={building.id}
                        type="button"
                        onClick={() => setSelectedBuilding(building)}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50"
                      >
                        <p className="font-medium">
                          #{building.rank} {building.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {building.heightM} m · {building.completedYear ?? "year unknown"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No cluster selected.</p>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="mb-4 text-lg font-semibold">Country distribution</h2>
              {barList(countBy(filteredBuildings, "country"))}
            </section>
          </aside>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Map-linked table</h2>
            <p className="mt-1 text-sm text-slate-500">
              Click any row to focus its city cluster and inspect the record.
            </p>
          </div>

          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Building</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Height</th>
                  <th className="px-4 py-3">Floors</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Function</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuildings.map((building) => (
                  <tr
                    key={building.id}
                    onClick={() => {
                      setSelectedClusterId(`${building.city}::${building.country}`);
                      setSelectedBuilding(building);
                    }}
                    className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium">#{building.rank}</td>
                    <td className="px-4 py-3 font-medium">{building.name}</td>
                    <td className="px-4 py-3 text-slate-600">{building.city}</td>
                    <td className="px-4 py-3 text-slate-600">{building.country}</td>
                    <td className="px-4 py-3 text-slate-600">{building.heightM} m</td>
                    <td className="px-4 py-3 text-slate-600">{building.floors ?? "unknown"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {building.completedYear ?? "unknown"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {building.functionLabel ?? "Building"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}