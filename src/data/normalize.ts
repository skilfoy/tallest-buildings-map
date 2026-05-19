import type { Building, CityCluster, DashboardFilters } from "./types";

export function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export function clusterByCity(buildings: Building[]): CityCluster[] {
  const groups = new Map<string, CityCluster>();

  buildings.forEach((building) => {
    const id = `${building.city}::${building.country}`;

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        city: building.city,
        country: building.country,
        latitude: building.latitude,
        longitude: building.longitude,
        buildings: [],
        count: 0,
        tallest: building,
      });
    }

    const group = groups.get(id);
    if (!group) return;

    group.buildings.push(building);
    group.count += 1;

    if (building.heightM > group.tallest.heightM) {
      group.tallest = building;
    }
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      buildings: group.buildings.slice().sort((a, b) => a.rank - b.rank),
    }))
    .sort((a, b) => b.tallest.heightM - a.tallest.heightM);
}

export function applyFilters(
  buildings: Building[],
  filters: DashboardFilters,
): Building[] {
  const query = normalizeSearch(filters.query);

  return buildings.filter((building) => {
    const searchable = [
      building.rank,
      building.name,
      building.city,
      building.country,
      building.heightM,
      building.completedYear,
      building.functionLabel,
      building.material,
    ]
      .join(" ")
      .toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (filters.country !== "All" && building.country !== filters.country) return false;
    if (filters.city !== "All" && building.city !== filters.city) return false;
    if (building.heightM < filters.minHeight) return false;
    if (building.heightM > filters.maxHeight) return false;

    if (
      building.completedYear &&
      Number.isFinite(building.completedYear) &&
      building.completedYear < filters.minYear
    ) {
      return false;
    }

    if (
      building.completedYear &&
      Number.isFinite(building.completedYear) &&
      building.completedYear > filters.maxYear
    ) {
      return false;
    }

    return true;
  });
}

export function csvEscape(value: unknown): string {
  const stringValue = String(value ?? "");
  const shouldEscape =
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"');

  if (!shouldEscape) return stringValue;

  return `"${stringValue.split('"').join('""')}"`;
}

export function toCsv(buildings: Building[]): string {
  const headers = [
    "rank",
    "name",
    "city",
    "country",
    "heightM",
    "heightFt",
    "floors",
    "completedYear",
    "functionLabel",
    "material",
    "latitude",
    "longitude",
    "coordinatePrecision",
    "sourceUrl",
  ];

  const rows = buildings.map((building) =>
    [
      building.rank,
      building.name,
      building.city,
      building.country,
      building.heightM,
      building.heightFt,
      building.floors,
      building.completedYear,
      building.functionLabel,
      building.material,
      building.latitude,
      building.longitude,
      building.coordinatePrecision,
      building.sourceUrl,
    ]
      .map(csvEscape)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(buildings: Building[]): void {
  const blob = new Blob([toCsv(buildings)], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "tallest-buildings-filtered.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}