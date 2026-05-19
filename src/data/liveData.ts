import type { Building, DataEnvelope } from "./types";

type SparqlBinding = {
  item?: { value: string };
  itemLabel?: { value: string };
  height?: { value: string };
  coords?: { value: string };
  countryLabel?: { value: string };
  cityLabel?: { value: string };
  completed?: { value: string };
  floors?: { value: string };
  instanceLabel?: { value: string };
};

type SparqlResponse = {
  results?: {
    bindings?: SparqlBinding[];
  };
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function parsePoint(value: string | undefined): { latitude: number; longitude: number } | null {
  if (!value) return null;

  const match = /Point\(([-0-9.]+) ([-0-9.]+)\)/.exec(value);
  if (!match) return null;

  const longitude = Number(match[1]);
  const latitude = Number(match[2]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return { latitude, longitude };
}

function parseYear(value: string | undefined): number | null {
  if (!value) return null;

  const year = new Date(value).getUTCFullYear();
  return Number.isFinite(year) ? year : null;
}

function rankTop100(buildings: Omit<Building, "rank">[]): Building[] {
  return buildings
    .slice()
    .sort((a, b) => b.heightM - a.heightM)
    .slice(0, 100)
    .map((building, index) => ({
      ...building,
      rank: index + 1,
    }));
}

export async function fetchLiveBuildings(): Promise<DataEnvelope> {
  const query = `
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.bigdata.com/rdf#>

SELECT ?item ?itemLabel ?height ?coords ?countryLabel ?cityLabel ?completed ?floors ?instanceLabel WHERE {
  ?item wdt:P31/wdt:P279* wd:Q811979.
  ?item wdt:P2048 ?height.
  ?item wdt:P625 ?coords.
  ?item wdt:P17 ?country.
  OPTIONAL { ?item wdt:P131 ?city. }
  OPTIONAL { ?item wdt:P576 ?completed. }
  OPTIONAL { ?item wdt:P1101 ?floors. }
  OPTIONAL { ?item wdt:P31 ?instance. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  FILTER(?height > 200)
}
ORDER BY DESC(?height)
LIMIT 250
`;

  const url =
    "https://query.wikidata.org/sparql?format=json&query=" +
    encodeURIComponent(query);

  const response = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Wikidata request failed with status ${response.status}`);
  }

  const data = (await response.json()) as SparqlResponse;
  const rows = data.results?.bindings ?? [];

  const parsed = rows
    .map((binding): Omit<Building, "rank"> | null => {
      const coords = parsePoint(binding.coords?.value);
      const heightM = Number(binding.height?.value);

      if (!coords || !Number.isFinite(heightM)) return null;

      const name = clean(binding.itemLabel?.value);
      const country = clean(binding.countryLabel?.value) || "Unknown country";
      const city = clean(binding.cityLabel?.value) || "Unknown city";
      const floors = Number(binding.floors?.value);

      return {
        id: clean(binding.item?.value) || name,
        name,
        city,
        country,
        heightM,
        floors: Number.isFinite(floors) ? floors : null,
        completedYear: parseYear(binding.completed?.value),
        functionLabel: clean(binding.instanceLabel?.value) || "Building",
        material: "Unknown",
        latitude: coords.latitude,
        longitude: coords.longitude,
        coordinatePrecision: "exact",
        source: "live",
        sourceUrl: clean(binding.item?.value),
      };
    })
    .filter((building): building is Omit<Building, "rank"> => building !== null);

  return {
    source: "live",
    fetchedAt: new Date().toISOString(),
    ttlHours: 24,
    buildings: rankTop100(parsed),
  };
}