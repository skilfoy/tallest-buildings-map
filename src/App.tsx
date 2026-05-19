// @ts-nocheck
import { useMemo, useState } from "react";
import {
  Building2,
  Download,
  Filter,
  Layers,
  MapPin,
  Ruler,
  Search,
  Table2,
  X,
} from "lucide-react";

const CITY_COORDINATES = {
  "Abu Dhabi, United Arab Emirates": [24.4539, 54.3773],
  "Beijing, China": [39.9042, 116.4074],
  "Busan, South Korea": [35.1796, 129.0756],
  "Cairo, Egypt": [30.0444, 31.2357],
  "Changsha, China": [28.2282, 112.9388],
  "Chicago, United States": [41.8781, -87.6298],
  "Chongqing, China": [29.563, 106.5516],
  "Dalian, China": [38.914, 121.6147],
  "Dongguan, China": [23.0207, 113.7518],
  "Dubai, United Arab Emirates": [25.2048, 55.2708],
  "Gold Coast, Australia": [-28.0167, 153.4],
  "Guangzhou, China": [23.1291, 113.2644],
  "Guiyang, China": [26.647, 106.6302],
  "Hanoi, Vietnam": [21.0278, 105.8342],
  "Ho Chi Minh City, Vietnam": [10.8231, 106.6297],
  "Hong Kong, Hong Kong": [22.3193, 114.1694],
  "Kuala Lumpur, Malaysia": [3.139, 101.6869],
  "Kunming, China": [25.0389, 102.7183],
  "Kuwait City, Kuwait": [29.3759, 47.9774],
  "Mecca, Saudi Arabia": [21.3891, 39.8579],
  "Moscow, Russia": [55.7558, 37.6173],
  "Nanjing, China": [32.0603, 118.7969],
  "Nanning, China": [22.817, 108.3669],
  "New York City, United States": [40.7128, -74.006],
  "Ningbo, China": [29.8683, 121.544],
  "Philadelphia, United States": [39.9526, -75.1652],
  "Qingdao, China": [36.0671, 120.3826],
  "Riyadh, Saudi Arabia": [24.7136, 46.6753],
  "San Francisco, United States": [37.7749, -122.4194],
  "Seoul, South Korea": [37.5665, 126.978],
  "Shanghai, China": [31.2304, 121.4737],
  "Shenyang, China": [41.8057, 123.4315],
  "Shenzhen, China": [22.5431, 114.0579],
  "St. Petersburg, Russia": [59.9311, 30.3609],
  "Suzhou, China": [31.2989, 120.5853],
  "Taipei, Taiwan": [25.033, 121.5654],
  "Tianjin, China": [39.0842, 117.2009],
  "Wuhan, China": [30.5928, 114.3055],
  "Wuxi, China": [31.4912, 120.3119],
  "Xi'an, China": [34.3416, 108.9398],
  "Xiamen, China": [24.4798, 118.0894],
  "Zhuhai, China": [22.2711, 113.5767],
};

const RAW_DATA = `rank|name|city|country|completed|heightM|heightFt|floors|material|buildingFunction
1|Burj Khalifa|Dubai|United Arab Emirates|2010|828|2717|163|Steel Over Concrete|Office / Residential / Hotel
2|Merdeka 118|Kuala Lumpur|Malaysia|2023|679|2227|118|Concrete-Steel Composite|Hotel / Serviced Apartments / Office
3|Shanghai Tower|Shanghai|China|2015|632|2073|128|Concrete-Steel Composite|Hotel / Office
4|Makkah Royal Clock Tower|Mecca|Saudi Arabia|2012|601|1972|120|Steel Over Concrete|Serviced Apartments / Hotel / Retail
5|Ping An Finance Center|Shenzhen|China|2017|599|1965|115|Concrete-Steel Composite|Office
6|Lotte World Tower|Seoul|South Korea|2017|555|1819|123|Composite|Hotel / Office / Residential / Retail
7|One World Trade Center|New York City|United States|2014|541|1776|94|Composite|Office
8|Guangzhou CTF Finance Centre|Guangzhou|China|2016|530|1739|111|Concrete-Steel Composite|Hotel / Residential / Office
9|Tianjin CTF Finance Centre|Tianjin|China|2019|530|1739|97|Concrete-Steel Composite|Hotel / Serviced Apartments / Office
10|CITIC Tower|Beijing|China|2018|528|1731|109|Composite|Office
11|TAIPEI 101|Taipei|Taiwan|2004|508|1667|101|Composite|Office
12|Shanghai World Financial Center|Shanghai|China|2008|492|1614|101|Composite|Hotel / Office
13|International Commerce Centre|Hong Kong|Hong Kong|2010|484|1588|108|Composite|Hotel / Office
14|Wuhan Greenland Center|Wuhan|China|2023|476|1562|97|Composite|Hotel / Residential / Office
15|Central Park Tower|New York City|United States|2020|472|1550|98|Concrete|Residential / Retail
16|Lakhta Center|St. Petersburg|Russia|2019|462|1516|87|Composite|Office
17|Vincom Landmark 81|Ho Chi Minh City|Vietnam|2018|461|1513|81|Concrete|Hotel / Residential
18|Changsha IFS Tower T1|Changsha|China|2018|452|1483|94|Composite|Hotel / Office
19|Petronas Twin Tower 1|Kuala Lumpur|Malaysia|1998|452|1483|88|Composite|Office
20|Petronas Twin Tower 2|Kuala Lumpur|Malaysia|1998|452|1483|88|Composite|Office
21|Suzhou IFS|Suzhou|China|2019|450|1476|95|Composite|Hotel / Office / Serviced Apartments
22|Zifeng Tower|Nanjing|China|2010|450|1476|66|Composite|Hotel / Office / Retail
23|The Exchange 106|Kuala Lumpur|Malaysia|2019|446|1463|95|Concrete|Office
24|Willis Tower|Chicago|United States|1974|442|1451|108|Steel|Office
25|KK100|Shenzhen|China|2011|442|1449|100|Composite|Hotel / Office
26|Guangzhou International Finance Center|Guangzhou|China|2010|439|1439|103|Composite|Hotel / Office
27|Wuhan Center Tower|Wuhan|China|2019|438|1437|88|Composite|Hotel / Office / Residential
28|111 West 57th Street|New York City|United States|2021|435|1428|84|Concrete|Residential
29|One Vanderbilt Avenue|New York City|United States|2020|427|1401|62|Composite|Office
30|432 Park Avenue|New York City|United States|2015|426|1397|85|Concrete|Residential
31|Marina 101|Dubai|United Arab Emirates|2017|425|1394|101|Concrete|Hotel / Residential
32|Trump International Hotel & Tower|Chicago|United States|2009|423|1389|98|Concrete|Hotel / Residential
33|Dongguan International Trade Center 1|Dongguan|China|2022|423|1388|85|Composite|Office
34|Jin Mao Tower|Shanghai|China|1999|421|1380|88|Composite|Hotel / Office
35|Princess Tower|Dubai|United Arab Emirates|2012|414|1356|101|Concrete|Residential
36|Al Hamra Tower|Kuwait City|Kuwait|2011|413|1354|80|Concrete|Office
37|Two International Finance Centre|Hong Kong|Hong Kong|2003|412|1352|88|Composite|Office
38|Haeundae LCT The Sharp Landmark Tower|Busan|South Korea|2019|412|1350|101|Concrete|Hotel / Residential
39|Ningbo Center Tower 1|Ningbo|China|2021|409|1342|80|Composite|Office
40|Guangxi China Resources Tower|Nanning|China|2020|403|1321|86|Composite|Office
41|Guiyang International Financial Center T1|Guiyang|China|2020|401|1316|79|Composite|Hotel / Office
42|China Resources Tower|Shenzhen|China|2018|393|1289|68|Composite|Office
43|23 Marina|Dubai|United Arab Emirates|2012|393|1289|88|Concrete|Residential
44|CITIC Plaza|Guangzhou|China|1997|390|1280|80|Concrete|Office
45|30 Hudson Yards|New York City|United States|2019|387|1268|73|Composite|Office
46|Riyadh PIF Tower|Riyadh|Saudi Arabia|2021|385|1263|72|Composite|Office
47|Shun Hing Square|Shenzhen|China|1996|384|1260|69|Composite|Office
48|Eton Place Dalian Tower 1|Dalian|China|2015|383|1257|80|Composite|Hotel / Office / Residential
49|Nanning Logan Century 1|Nanning|China|2018|381|1251|82|Composite|Hotel / Office
50|Empire State Building|New York City|United States|1931|381|1250|102|Steel|Office
51|Elite Residence|Dubai|United Arab Emirates|2012|380|1248|87|Concrete|Residential
52|Central Plaza|Hong Kong|Hong Kong|1992|374|1227|78|Composite|Office
53|Federation Tower|Moscow|Russia|2017|374|1226|93|Concrete|Office / Residential
54|Dalian Greenland Center|Dalian|China|2019|370|1214|88|Composite|Hotel / Office
55|The Address Boulevard|Dubai|United Arab Emirates|2017|370|1214|73|Concrete|Hotel / Residential
56|Qingdao Hai Tian Center|Qingdao|China|2020|369|1211|73|Composite|Hotel / Office / Residential
57|Bank of China Tower|Hong Kong|Hong Kong|1990|367|1205|72|Composite|Office
58|Bank of America Tower|New York City|United States|2009|366|1200|55|Composite|Office
59|St. Regis Chicago|Chicago|United States|2020|363|1191|101|Concrete|Hotel / Residential
60|Almas Tower|Dubai|United Arab Emirates|2008|363|1189|68|Composite|Office
61|Hanking Center Tower|Shenzhen|China|2018|359|1177|65|Composite|Office
62|Gevora Hotel|Dubai|United Arab Emirates|2017|356|1168|75|Concrete|Hotel
63|JW Marriott Marquis Hotel Dubai Tower 1|Dubai|United Arab Emirates|2012|355|1165|82|Concrete|Hotel
64|JW Marriott Marquis Hotel Dubai Tower 2|Dubai|United Arab Emirates|2013|355|1165|82|Concrete|Hotel
65|Emirates Tower One|Dubai|United Arab Emirates|2000|355|1163|54|Composite|Office
66|Raffles City Chongqing T3N|Chongqing|China|2019|354|1161|79|Composite|Residential / Retail
67|Raffles City Chongqing T4N|Chongqing|China|2019|354|1161|74|Composite|Residential / Retail
68|Raffles City Chongqing T3S|Chongqing|China|2019|354|1161|79|Composite|Residential / Retail
69|Raffles City Chongqing T4S|Chongqing|China|2019|354|1161|74|Composite|Residential / Retail
70|Forum 66 Tower 1|Shenyang|China|2015|351|1150|68|Composite|Office
71|The Pinnacle|Guangzhou|China|2012|350|1148|60|Composite|Office
72|Xi'an Glory International Financial Center|Xi'an|China|2022|350|1148|75|Composite|Office
73|Spring City 66|Kunming|China|2019|349|1145|66|Composite|Office
74|The Torch|Dubai|United Arab Emirates|2011|348|1142|86|Concrete|Residential
75|The Center|Hong Kong|Hong Kong|1998|346|1135|73|Steel|Office
76|875 North Michigan Avenue|Chicago|United States|1969|344|1128|100|All-Steel|Office
77|Shimao Hunan Center|Changsha|China|2019|343|1125|74|Composite|Hotel / Office
78|Four Seasons Place Kuala Lumpur|Kuala Lumpur|Malaysia|2018|343|1125|74|Concrete|Hotel / Residential
79|ADNOC Headquarters|Abu Dhabi|United Arab Emirates|2015|342|1122|65|Concrete|Office
80|Comcast Technology Center|Philadelphia|United States|2018|342|1121|59|Composite|Hotel / Office
81|One Shenzhen Bay Tower 7|Shenzhen|China|2018|341|1119|71|Composite|Office / Hotel / Residential
82|Wuxi International Finance Square|Wuxi|China|2014|339|1112|68|Composite|Hotel / Office
83|Chongqing World Financial Center|Chongqing|China|2015|339|1112|72|Composite|Hotel / Office
84|Mercury City Tower|Moscow|Russia|2013|339|1112|75|Concrete|Office / Residential
85|Xiamen International Center|Xiamen|China|2019|339|1112|68|Composite|Office
86|Hengqin International Finance Center|Zhuhai|China|2020|339|1112|69|Composite|Office
87|Tianjin Modern City Office Tower|Tianjin|China|2016|338|1109|65|Composite|Office
88|Tianjin World Financial Center|Tianjin|China|2011|337|1105|75|Composite|Office
89|Rose Rayhaan by Rotana|Dubai|United Arab Emirates|2007|333|1093|71|Concrete|Hotel
90|Minsheng Bank Building|Wuhan|China|2007|331|1087|68|Composite|Office
91|China World Trade Center Phase 3A|Beijing|China|2010|330|1083|74|Composite|Hotel / Office
92|Keangnam Hanoi Landmark Tower|Hanoi|Vietnam|2011|329|1079|72|Concrete|Hotel / Residential / Office
93|Wuxi Suning Plaza 1|Wuxi|China|2014|328|1076|68|Composite|Hotel / Office
94|The Index|Dubai|United Arab Emirates|2010|328|1076|80|Concrete|Office / Residential
95|Longxi International Hotel|Wuxi|China|2011|328|1076|72|Concrete|Hotel
96|Oceanwide Center T1|San Francisco|United States|2022|326|1070|61|Composite|Office / Residential
97|Q1 Tower|Gold Coast|Australia|2005|323|1058|78|Concrete|Residential
98|Nina Tower|Hong Kong|Hong Kong|2006|319|1047|80|Concrete|Hotel / Office
99|Shenzhen Special Zone Press Tower|Shenzhen|China|1998|262|860|47|Composite|Office
100|Ningbo Bank of China Headquarters|Ningbo|China|2020|246|807|49|Composite|Office`;

function parseBuildings(rawText) {
  const lines = rawText.trim().split("\n");
  return lines.slice(1).map((line) => {
    const columns = line.split("|");
    const [rank, name, city, country, completed, heightM, heightFt, floors, material, buildingFunction] = columns;
    const location = `${city}, ${country}`;
    const coordinates = CITY_COORDINATES[location] ?? [0, 0];
    return {
      rank: Number(rank),
      name,
      city,
      country,
      location,
      completed: Number(completed),
      heightM: Number(heightM),
      heightFt: Number(heightFt),
      floors: Number(floors),
      material,
      function: buildingFunction,
      primaryFunction: buildingFunction.split("/")[0].trim(),
      lat: coordinates[0],
      lon: coordinates[1],
      coordinatePrecision: "city",
    };
  });
}

const buildings = parseBuildings(RAW_DATA);
const TILE_ZOOM = 2;
const TILE_SIZE = 256;
const WORLD_SIZE = TILE_SIZE * Math.pow(2, TILE_ZOOM);
const TILE_INDICES = Array.from({ length: Math.pow(2, TILE_ZOOM) }, (_, index) => index);

const palette = ["#2563eb", "#7c3aed", "#ea580c", "#059669", "#dc2626", "#0891b2", "#db2777", "#475569", "#ca8a04", "#0f766e"];

function colorForCountry(country, countries) {
  const index = countries.indexOf(country);
  return palette[index % palette.length] ?? "#0f172a";
}

function projectMercator(lat, lon, zoom = TILE_ZOOM) {
  const sinLatitude = Math.sin((lat * Math.PI) / 180);
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = ((lon + 180) / 360) * scale;
  const y = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function groupByCity(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = row.location;
    if (!groups.has(key)) {
      const projected = projectMercator(row.lat, row.lon);
      groups.set(key, {
        key,
        city: row.city,
        country: row.country,
        location: row.location,
        lat: row.lat,
        lon: row.lon,
        x: projected.x,
        y: projected.y,
        buildings: [],
        tallest: row,
        count: 0,
      });
    }
    const group = groups.get(key);
    group.buildings.push(row);
    group.count += 1;
    if (row.heightM > group.tallest.heightM) group.tallest = row;
  });
  return Array.from(groups.values()).sort((a, b) => b.tallest.heightM - a.tallest.heightM);
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  const needsEscaping = stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"');
  if (!needsEscaping) return stringValue;
  return `"${stringValue.split('"').join('""')}"`;
}

function toCsv(rows) {
  const headers = ["rank", "name", "city", "country", "completed", "heightM", "heightFt", "floors", "material", "function", "latitude", "longitude", "coordinatePrecision"];
  const csvRows = rows.map((row) => [row.rank, row.name, row.city, row.country, row.completed, row.heightM, row.heightFt, row.floors, row.material, row.function, row.lat, row.lon, row.coordinatePrecision].map(csvEscape).join(","));
  return [headers.join(","), ...csvRows].join("\n");
}

function downloadCsv(rows) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "filtered-tallest-buildings-map.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function runTests() {
  console.assert(buildings.length === 100, "Expected exactly 100 building records.");
  console.assert(buildings[0].name === "Burj Khalifa", "Expected Burj Khalifa to be the top ranked record.");
  console.assert(buildings[0].heightM === 828, "Expected Burj Khalifa height to parse as a number.");
  console.assert(buildings.every((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon)), "Expected every building to have numeric coordinates.");
  console.assert(groupByCity(buildings).some((group) => group.location === "Dubai, United Arab Emirates" && group.count > 1), "Expected Dubai to be grouped as a multi-building city cluster.");
  console.assert(csvEscape('Alpha, "Beta"') === '"Alpha, ""Beta"""', "Expected CSV escaping to quote commas and double quote characters.");
  console.assert(toCsv(buildings.slice(0, 1)).split("\n").length === 2, "Expected one data row plus one header row in CSV output.");
  const origin = projectMercator(0, 0);
  console.assert(Math.abs(origin.x - WORLD_SIZE / 2) < 0.0001, "Expected longitude zero to project to the horizontal center.");
  console.assert(Math.abs(origin.y - WORLD_SIZE / 2) < 0.0001, "Expected latitude zero to project to the vertical center.");
  console.assert(groupByCity(buildings).every((group) => Number.isFinite(group.x) && Number.isFinite(group.y)), "Expected every city cluster to have projected map coordinates.");
}

runTests();

function statCard(icon, label, value, detail) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-950">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function barList(rows, labelKey, valueKey, color = "#2563eb") {
  const max = Math.max(...rows.map((row) => row[valueKey]), 1);
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row[labelKey]}>
          <div className="mb-1 flex justify-between gap-4 text-xs text-slate-600">
            <span className="truncate">{row[labelKey]}</span>
            <span className="font-medium">{row[valueKey]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${(row[valueKey] / max) * 100}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TileWorldMap({ cityGroups, countries, selectedGroup, onSelectLocation }) {
  return (
    <div className="relative h-[620px] overflow-hidden bg-slate-200">
      <div className="absolute left-1/2 top-1/2 h-[1024px] w-[1024px] -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-inner">
        {TILE_INDICES.map((x) =>
          TILE_INDICES.map((y) => (
            <img
              key={`${x}-${y}`}
              src={`https://tile.openstreetmap.org/${TILE_ZOOM}/${x}/${y}.png`}
              alt=""
              className="absolute h-64 w-64 select-none"
              style={{ left: x * TILE_SIZE, top: y * TILE_SIZE }}
              draggable={false}
            />
          ))
        )}
        <div className="absolute inset-0 bg-white/5" />
        {cityGroups.map((group) => {
          const color = colorForCountry(group.country, countries);
          const radius = Math.max(10, Math.min(30, 8 + group.count * 3 + (group.tallest.heightM - 246) / 65));
          const active = selectedGroup?.location === group.location;
          return (
            <button
              key={group.location}
              type="button"
              onClick={() => onSelectLocation(group.location)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg outline-none transition hover:scale-110 focus:ring-4 focus:ring-slate-950/25"
              style={{
                left: group.x,
                top: group.y,
                width: active ? radius * 2 + 10 : radius * 2,
                height: active ? radius * 2 + 10 : radius * 2,
                backgroundColor: color,
                boxShadow: active ? "0 0 0 8px rgba(15, 23, 42, 0.22), 0 18px 35px rgba(15, 23, 42, 0.26)" : "0 10px 24px rgba(15, 23, 42, 0.22)",
              }}
              aria-label={`${group.location}, ${group.count} buildings`}
            >
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">{group.count}</span>
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 hidden w-64 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 shadow-xl group-hover:block">
                <span className="block font-semibold text-slate-950">{group.location}</span>
                <span className="mt-1 block">{group.count} building{group.count === 1 ? "" : "s"}</span>
                <span className="block">Tallest: {group.tallest.name}, {group.tallest.heightM} m</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm">
        Map tiles: OpenStreetMap. Markers are city clusters.
      </div>
    </div>
  );
}

export default function BatchGeoReplacementMap() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All");
  const [city, setCity] = useState("All");
  const [material, setMaterial] = useState("All");
  const [primaryFunction, setPrimaryFunction] = useState("All");
  const [minHeight, setMinHeight] = useState(246);
  const [maxHeight, setMaxHeight] = useState(828);
  const [minYear, setMinYear] = useState(1931);
  const [maxYear, setMaxYear] = useState(2023);
  const [selectedLocation, setSelectedLocation] = useState("Dubai, United Arab Emirates");

  const countries = useMemo(() => Array.from(new Set(buildings.map((row) => row.country))).sort(), []);
  const countryOptions = useMemo(() => ["All", ...countries], [countries]);
  const cityOptions = useMemo(() => {
    const scoped = country === "All" ? buildings : buildings.filter((row) => row.country === country);
    return ["All", ...Array.from(new Set(scoped.map((row) => row.city))).sort()];
  }, [country]);
  const materialOptions = useMemo(() => ["All", ...Array.from(new Set(buildings.map((row) => row.material))).sort()], []);
  const functionOptions = useMemo(() => ["All", ...Array.from(new Set(buildings.map((row) => row.primaryFunction))).sort()], []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return buildings.filter((row) => {
      const searchable = `${row.name} ${row.city} ${row.country} ${row.material} ${row.function}`.toLowerCase();
      return (!normalized || searchable.includes(normalized)) && (country === "All" || row.country === country) && (city === "All" || row.city === city) && (material === "All" || row.material === material) && (primaryFunction === "All" || row.primaryFunction === primaryFunction) && row.heightM >= minHeight && row.heightM <= maxHeight && row.completed >= minYear && row.completed <= maxYear;
    });
  }, [query, country, city, material, primaryFunction, minHeight, maxHeight, minYear, maxYear]);

  const cityGroups = useMemo(() => groupByCity(filtered), [filtered]);
  const selectedGroup = cityGroups.find((group) => group.location === selectedLocation) ?? cityGroups[0] ?? null;
  const selectedBuilding = selectedGroup?.tallest ?? null;

  const stats = useMemo(() => {
    const averageHeight = filtered.length ? Math.round(filtered.reduce((sum, row) => sum + row.heightM, 0) / filtered.length) : 0;
    const tallest = filtered.length ? Math.max(...filtered.map((row) => row.heightM)) : 0;
    return { buildings: filtered.length, cities: cityGroups.length, averageHeight, tallest };
  }, [filtered, cityGroups]);

  const countryBars = useMemo(() => {
    const counts = new Map();
    filtered.forEach((row) => counts.set(row.country, (counts.get(row.country) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [filtered]);

  const functionBars = useMemo(() => {
    const counts = new Map();
    filtered.forEach((row) => counts.set(row.primaryFunction, (counts.get(row.primaryFunction) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [filtered]);

  const decadeBars = useMemo(() => {
    const counts = new Map();
    filtered.forEach((row) => {
      const decade = `${Math.floor(row.completed / 10) * 10}s`;
      counts.set(decade, (counts.get(decade) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([decade, count]) => ({ decade, count })).sort((a, b) => Number(a.decade.slice(0, 4)) - Number(b.decade.slice(0, 4)));
  }, [filtered]);

  function resetFilters() {
    setQuery("");
    setCountry("All");
    setCity("All");
    setMaterial("All");
    setPrimaryFunction("All");
    setMinHeight(246);
    setMaxHeight(828);
    setMinYear(1931);
    setMaxYear(2023);
    setSelectedLocation("Dubai, United Arab Emirates");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.28em] text-slate-300">Open data mapping dashboard</p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">World's Tallest Buildings</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">A BatchGeo-style workflow rebuilt as a local React application with OpenStreetMap raster tiles, city-clustered markers, synchronized filters, analytical summaries, and CSV export.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-slate-200">
              <p className="font-medium text-white">Coordinate model</p>
              <p>City-level coordinates</p>
              <p>No paid geocoding service required</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {statCard(<Building2 size={20} />, "Buildings", stats.buildings, "Filtered structures currently in scope.")}
          {statCard(<MapPin size={20} />, "Mapped cities", stats.cities, "Clusters preserve accurate city placement.")}
          {statCard(<Ruler size={20} />, "Tallest", `${stats.tallest} m`, "Maximum height in the active view.")}
          {statCard(<Layers size={20} />, "Average height", `${stats.averageHeight} m`, "Mean height across filtered records.")}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Filter size={16} />Filters</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={resetFilters} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"><X size={15} /> Reset</button>
              <button onClick={() => downloadCsv(filtered)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"><Download size={15} /> Export CSV</button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
            <label className="relative block">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search building, city, country, material, or function" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white" />
            </label>
            <select value={country} onChange={(event) => { setCountry(event.target.value); setCity("All"); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white">{countryOptions.map((option) => <option key={option}>{option}</option>)}</select>
            <select value={city} onChange={(event) => setCity(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white">{cityOptions.map((option) => <option key={option}>{option}</option>)}</select>
            <select value={material} onChange={(event) => setMaterial(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white">{materialOptions.map((option) => <option key={option}>{option}</option>)}</select>
            <select value={primaryFunction} onChange={(event) => setPrimaryFunction(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white">{functionOptions.map((option) => <option key={option}>{option}</option>)}</select>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="mb-2 flex justify-between text-xs font-medium text-slate-500"><span>Height range</span><span>{minHeight} m to {maxHeight} m</span></div>
              <div className="grid gap-3 md:grid-cols-2"><input type="range" min="246" max="828" value={minHeight} onChange={(event) => setMinHeight(Math.min(Number(event.target.value), maxHeight))} className="w-full accent-slate-950" /><input type="range" min="246" max="828" value={maxHeight} onChange={(event) => setMaxHeight(Math.max(Number(event.target.value), minHeight))} className="w-full accent-slate-950" /></div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="mb-2 flex justify-between text-xs font-medium text-slate-500"><span>Completion year range</span><span>{minYear} to {maxYear}</span></div>
              <div className="grid gap-3 md:grid-cols-2"><input type="range" min="1931" max="2023" value={minYear} onChange={(event) => setMinYear(Math.min(Number(event.target.value), maxYear))} className="w-full accent-slate-950" /><input type="range" min="1931" max="2023" value={maxYear} onChange={(event) => setMaxYear(Math.max(Number(event.target.value), minYear))} className="w-full accent-slate-950" /></div>
            </div>
          </div>
        </section>

        <main className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">OpenStreetMap tile layer</h2>
                <p className="text-sm leading-6 text-slate-500">Each marker is a city cluster. Click a cluster to inspect every building in that location.</p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs leading-5 text-slate-600">Marker number equals clustered buildings. Marker size reflects local density and height.</div>
            </div>
            <TileWorldMap cityGroups={cityGroups} countries={countries} selectedGroup={selectedGroup} onSelectLocation={setSelectedLocation} />
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-slate-950 p-3 text-white"><MapPin size={20} /></div><div><p className="text-sm text-slate-500">Selected cluster</p><h2 className="text-xl font-semibold">{selectedGroup?.location ?? "No results"}</h2></div></div>
              {selectedGroup && selectedBuilding && (<div className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Buildings</p><p className="font-semibold">{selectedGroup.count}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Tallest</p><p className="font-semibold">{selectedBuilding.heightM} m</p></div></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Tallest building</p><p className="font-semibold">#{selectedBuilding.rank} {selectedBuilding.name}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Coordinate precision</p><p className="font-semibold">City-level, shared by cluster</p></div></div>)}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Cluster records</h2>
              <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
                {(selectedGroup?.buildings ?? []).slice().sort((a, b) => a.rank - b.rank).map((row) => (<div key={row.rank} className="rounded-2xl border border-slate-200 bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">#{row.rank} {row.name}</p><p className="mt-1 text-sm text-slate-500">{row.function}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{row.heightM} m</span></div></div>))}
              </div>
            </section>
          </aside>
        </main>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold">Buildings by country</h2>{barList(countryBars, "name", "count", "#2563eb")}</div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold">Primary function mix</h2>{barList(functionBars, "name", "count", "#059669")}</div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold">Completion decade</h2>{barList(decadeBars, "decade", "count", "#7c3aed")}</div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-2"><Table2 size={18} /><h2 className="text-lg font-semibold">Map-linked table</h2></div><p className="text-sm text-slate-500">Click a row to select that city cluster.</p></div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Building</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Height</th><th className="px-4 py-3">Floors</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Material</th><th className="px-4 py-3">Function</th></tr></thead>
              <tbody>{filtered.map((row) => (<tr key={row.rank} onClick={() => setSelectedLocation(row.location)} className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"><td className="px-4 py-3 font-medium">#{row.rank}</td><td className="px-4 py-3 font-medium text-slate-950">{row.name}</td><td className="px-4 py-3 text-slate-600">{row.city}</td><td className="px-4 py-3 text-slate-600">{row.country}</td><td className="px-4 py-3 text-slate-600">{row.heightM} m</td><td className="px-4 py-3 text-slate-600">{row.floors}</td><td className="px-4 py-3 text-slate-600">{row.completed}</td><td className="px-4 py-3 text-slate-600">{row.material}</td><td className="px-4 py-3 text-slate-600">{row.function}</td></tr>))}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
