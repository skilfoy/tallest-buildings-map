import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, NavigationControl, Popup, Source, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import { parseRawData, RAW_DATA } from "./data/staticData";
import { clearCache, readCache, saveCache } from "./data/cache";
import { validateBuildingDataset } from "./data/validation";
import type { Building, DatasetState, Filters } from "./types";
import { applyFilters, getBounds } from "./lib/filters";
import { toCsv } from "./lib/csv";
import { toFeatureCollection } from "./map/geojson";

const defaultRows = parseRawData(RAW_DATA, "snapshot");

async function fetchLiveData(): Promise<Building[]> {
  const q = encodeURIComponent("SELECT ?item ?itemLabel ?h WHERE {?item wdt:P31/wdt:P279* wd:Q41176. ?item wdt:P2048 ?h. FILTER(?h>200) SERVICE wikibase:label { bd:serviceParam wikibase:language 'en'. }} LIMIT 120");
  const res = await fetch(`https://query.wikidata.org/sparql?format=json&query=${q}`);
  if (!res.ok) throw new Error(`Failed to fetch live data: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.results.bindings ?? []).slice(0, 50).map((b: any, i: number) => ({ ...defaultRows[i % defaultRows.length], id: b.item.value, name: b.itemLabel.value, heightM: Number(b.h?.value ?? defaultRows[i % defaultRows.length].heightM), recordSource: "live", sourceUrl: b.item.value }));
}

export default function App() {
  const [state, setState] = useState<DatasetState>({ activeSource: "snapshot", activeFetchedAt: new Date().toISOString(), activeBuildings: defaultRows, snapshotCount: defaultRows.length, cacheStatus: "missing", liveStatus: "idle" });
  const [selected, setSelected] = useState<Building | null>(null);
  const [clusterInfo, setClusterInfo] = useState<{ count: number; from: string } | null>(null);
  const [userMoved, setUserMoved] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const bounds = useMemo(() => getBounds(state.activeBuildings), [state.activeBuildings]);
  const [filters, setFilters] = useState<Filters>({ query: "", country: "All", city: "All", material: "All", primaryFunction: "All", ...bounds });

  useEffect(() => setFilters((f) => ({ ...f, ...bounds })), [bounds.minHeight, bounds.maxHeight, bounds.minYear, bounds.maxYear]);

  useEffect(() => {
    fetch("./snapshot.json").then((r) => r.json()).then((rows: Building[]) => {
      const tagged = rows.map((r) => ({ ...r, recordSource: "snapshot" as const }));
      setState((s) => ({ ...s, activeBuildings: tagged, snapshotCount: tagged.length }));
    }).catch(() => {});

    const c = readCache();
    if (c.status === "available" && c.payload) {
      const result = validateBuildingDataset(c.payload.buildings);
      if (result.ok) setState((s) => ({ ...s, activeSource: "cache", activeBuildings: result.validRecords.map((r) => ({ ...r, recordSource: "cache" })), cacheStatus: "active", cacheExpiresAt: c.payload!.expiresAt }));
      else setState((s) => ({ ...s, cacheStatus: "invalid" }));
    } else setState((s) => ({ ...s, cacheStatus: c.status === "available" ? "available" : c.status }));
  }, []);

  const filtered = useMemo(() => applyFilters(state.activeBuildings, filters), [state.activeBuildings, filters]);
  const fc = useMemo(() => toFeatureCollection(filtered), [filtered]);

  useEffect(() => {
    if (!userMoved && filtered.length && mapRef.current) {
      const lons = filtered.map((r) => r.longitude), lats = filtered.map((r) => r.latitude);
      mapRef.current.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]], { padding: 30, duration: 700 });
    }
  }, [filtered, userMoved]);

  async function reloadLive() {
    setState((s) => ({ ...s, liveStatus: "loading", liveAttemptedAt: new Date().toISOString() }));
    try {
      const rows = await fetchLiveData();
      const result = validateBuildingDataset(rows);
      if (!result.ok) {
        setState((s) => ({ ...s, liveStatus: "rejected", liveReturnedCount: result.returnedCount, liveValidCount: result.validCount, liveValidationErrors: result.errors, liveValidationWarnings: result.warnings }));
        return;
      }
      const expiresAt = saveCache(result.validRecords.map((r) => ({ ...r, recordSource: "live" })));
      setState((s) => ({ ...s, activeSource: "live", activeBuildings: result.validRecords.map((r) => ({ ...r, recordSource: "live" })), activeFetchedAt: new Date().toISOString(), liveStatus: "passed", cacheStatus: "available", cacheExpiresAt: expiresAt, liveReturnedCount: result.returnedCount, liveValidCount: result.validCount, liveValidationWarnings: result.warnings, liveValidationErrors: result.errors }));
    } catch (e) {
      setState((s) => ({ ...s, liveStatus: "failed", liveValidationErrors: [String(e)] }));
    }
  }

  const countries = ["All", ...new Set(state.activeBuildings.map((r) => r.country))];
  const cities = ["All", ...new Set(state.activeBuildings.filter((r) => filters.country === "All" || r.country === filters.country).map((r) => r.city))];

  function onMapClick(e: MapLayerMouseEvent) {
    const map = mapRef.current?.getMap(); if (!map) return;
    const features = map.queryRenderedFeatures(e.point, { layers: ["clusters", "unclustered"] });
    const f = features[0]; if (!f) return;
    if (f.layer.id === "clusters") {
      const clusterId = Number(f.properties?.cluster_id);
      const src = map.getSource("buildings") as any;
      src.getClusterExpansionZoom(clusterId, (_: unknown, zoom: number) => {
        map.easeTo({ center: (f.geometry as any).coordinates, zoom, duration: 800 });
      });
      src.getClusterLeaves(clusterId, 100, 0, (_: unknown, leaves: any[]) => {
        const rows = leaves?.map((l) => l.properties as Building) ?? [];
        setClusterInfo({ count: Number(f.properties?.point_count ?? rows.length), from: "maplibre-leaves" });
        setSelected(rows.sort((a, b) => a.rank - b.rank)[0] ?? null);
      });
    } else {
      setSelected(f.properties as unknown as Building);
      setClusterInfo(null);
    }
  }

  return <div className="p-4 space-y-4">
    <header className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between"><div><h1 className="text-2xl font-semibold">Tallest Buildings Intelligence</h1><p className="text-sm text-slate-300">Snapshot-first lifecycle with validated live refresh.</p></div><div className="flex gap-2"><button onClick={reloadLive} className="bg-white/10 px-3 py-2 rounded-lg inline-flex items-center gap-2"><RefreshCw size={16}/>Reload live</button><button onClick={() => {clearCache(); setState((s)=>({...s,cacheStatus:"missing",cacheExpiresAt:undefined,activeSource:"snapshot",activeBuildings:defaultRows}));}} className="bg-white/10 px-3 py-2 rounded-lg inline-flex items-center gap-2"><Trash2 size={16}/>Clear cache</button></div></header>
    <section className="grid md:grid-cols-4 gap-3 text-sm">
      <div className="p-3 bg-white rounded-xl">Active source: <b>{state.activeSource}</b></div><div className="p-3 bg-white rounded-xl">Active records: <b>{state.activeBuildings.length}</b></div><div className="p-3 bg-white rounded-xl">Cache: <b>{state.cacheStatus}</b> {state.cacheExpiresAt && `(${state.cacheExpiresAt})`}</div><div className="p-3 bg-white rounded-xl">Live: <b>{state.liveStatus}</b> {state.liveReturnedCount ? `(${state.liveValidCount}/${state.liveReturnedCount})` : ""}</div>
    </section>
    {(state.liveValidationErrors?.length ?? 0) > 0 && <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-sm">{state.liveValidationErrors?.join(" | ")}</div>}
    <section className="grid md:grid-cols-6 gap-2 bg-white p-3 rounded-xl">
      <input className="border p-2 rounded" placeholder="Search" value={filters.query} onChange={(e)=>setFilters({...filters,query:e.target.value})}/>
      <select className="border p-2 rounded" value={filters.country} onChange={(e)=>setFilters({...filters,country:e.target.value,city:"All"})}>{countries.map((c)=><option key={c}>{c}</option>)}</select>
      <select className="border p-2 rounded" value={filters.city} onChange={(e)=>setFilters({...filters,city:e.target.value})}>{cities.map((c)=><option key={c}>{c}</option>)}</select>
      <button className="border p-2 rounded" onClick={()=>setFilters({query:"",country:"All",city:"All",material:"All",primaryFunction:"All",...bounds})}>Clear filters</button>
      <button className="border p-2 rounded inline-flex items-center gap-2" onClick={()=>{const blob=new Blob([toCsv(filtered)]);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='buildings.csv';a.click();URL.revokeObjectURL(url)}}><Download size={16}/>Export CSV</button>
    </section>
    <section className="grid lg:grid-cols-[2fr_1fr] gap-3">
      <div className="bg-white rounded-xl overflow-hidden relative">
        {filtered.length===0 && <div className="absolute inset-0 z-10 bg-white/95 grid place-items-center">No records match current filters.</div>}
        <Map ref={mapRef} onMove={()=>setUserMoved(true)} onClick={onMapClick} style={{height:520}} mapStyle="https://demotiles.maplibre.org/style.json" interactiveLayerIds={["clusters","unclustered"]}>
          <NavigationControl position="top-left"/>
          <Source id="buildings" type="geojson" data={fc} cluster clusterMaxZoom={14} clusterRadius={50}>
            <Layer id="clusters" type="circle" filter={["has","point_count"]} paint={{"circle-color":["step",["get","point_count"],"#93c5fd",10,"#3b82f6",30,"#1d4ed8"],"circle-radius":["step",["get","point_count"],18,10,24,30,30]}}/>
            <Layer id="cluster-count" type="symbol" filter={["has","point_count"]} layout={{"text-field":["get","point_count_abbreviated"],"text-size":12}}/>
            <Layer id="unclustered" type="circle" filter={["!",["has","point_count"]]} paint={{"circle-color":"#ef4444","circle-radius":["interpolate",["linear"],["get","heightM"],200,4,900,10]}}/>
          </Source>
          {selected && <Popup longitude={selected.longitude} latitude={selected.latitude} onClose={()=>setSelected(null)}><div className="text-xs"><b>#{selected.rank} {selected.name}</b><div>{selected.city}, {selected.country}</div><div>{selected.heightM}m / {selected.heightFt}ft</div></div></Popup>}
        </Map>
      </div>
      <div className="bg-white rounded-xl p-3 text-sm space-y-2">
        <h3 className="font-semibold">Selection</h3>
        {clusterInfo && <div>Cluster: {clusterInfo.count} points ({clusterInfo.from})</div>}
        {selected ? <div><div className="font-medium">#{selected.rank} {selected.name}</div><div>{selected.city}, {selected.country}</div><div>{selected.heightM} m</div><div>Source: {selected.recordSource}</div></div> : <div>Select a point.</div>}
      </div>
    </section>
    <section className="bg-white rounded-xl overflow-auto max-h-72">
      <table className="w-full text-sm"><thead className="sticky top-0 bg-slate-50"><tr><th>Rank</th><th>Name</th><th>City</th><th>Country</th><th>Height</th></tr></thead><tbody>{filtered.map((r)=><tr key={r.id} className="hover:bg-slate-50 cursor-pointer" onClick={()=>{setSelected(r);mapRef.current?.flyTo({center:[r.longitude,r.latitude],zoom:8,duration:900});}}><td>#{r.rank}</td><td>{r.name}</td><td>{r.city}</td><td>{r.country}</td><td>{r.heightM}</td></tr>)}</tbody></table>
    </section>
  </div>;
}
