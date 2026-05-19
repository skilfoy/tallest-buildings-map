import { useMemo, useState } from 'react';
import { BuildingMap } from './components/BuildingMap';
import { buildings, type BuildingStatus } from './data/buildings';
import { downloadCsv, toCsv } from './utils';

const statuses: Array<BuildingStatus | 'all'> = ['all', 'completed', 'topped-out', 'under-construction'];

function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<BuildingStatus | 'all'>('all');
  const [minHeight, setMinHeight] = useState(450);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return buildings
      .filter((b) => (status === 'all' ? true : b.status === status))
      .filter((b) => b.heightM >= minHeight)
      .filter((b) => (q ? `${b.name} ${b.city} ${b.country}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.heightM - a.heightM);
  }, [minHeight, query, status]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl p-6 space-y-5">
        <header>
          <h1 className="text-3xl font-bold">World's Tallest Buildings Dashboard</h1>
          <p className="text-slate-600">Explore and export top skyscraper data with an interactive map.</p>
        </header>

        <section className="grid gap-4 rounded-xl bg-white p-4 shadow md:grid-cols-4">
          <input className="rounded border p-2" placeholder="Search building, city, country" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="rounded border p-2" value={status} onChange={(e) => setStatus(e.target.value as BuildingStatus | 'all')}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Minimum height: {minHeight}m</span>
            <input type="range" min={300} max={850} step={10} value={minHeight} onChange={(e) => setMinHeight(Number(e.target.value))} />
          </label>
          <button className="rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700" onClick={() => downloadCsv('tallest-buildings.csv', toCsv(filtered))}>
            Export CSV ({filtered.length})
          </button>
        </section>

        <BuildingMap buildings={filtered} />

        <section className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-3">Rank</th><th className="p-3">Building</th><th className="p-3">Location</th><th className="p-3">Height</th><th className="p-3">Floors</th><th className="p-3">Year</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{b.name}</td>
                  <td className="p-3">{b.city}, {b.country}</td>
                  <td className="p-3">{b.heightM} m</td>
                  <td className="p-3">{b.floors}</td>
                  <td className="p-3">{b.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default App;
