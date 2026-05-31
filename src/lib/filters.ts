import type { Building, Filters } from "../types";

export function getBounds(rows: Building[]) {
  if (!rows.length) {
    return {
      minHeight: 0,
      maxHeight: 0,
      minYear: 0,
      maxYear: 0,
    };
  }
  return {
    minHeight: Math.min(...rows.map((r) => r.heightM)),
    maxHeight: Math.max(...rows.map((r) => r.heightM)),
    minYear: Math.min(...rows.map((r) => r.completedYear)),
    maxYear: Math.max(...rows.map((r) => r.completedYear)),
  };
}

export function applyFilters(rows: Building[], f: Filters): Building[] {
  const q = f.query.trim().toLowerCase();
  return rows.filter((r) => {
    const s = `${r.name} ${r.city} ${r.country} ${r.material} ${r.functionLabel}`.toLowerCase();
    return (!q || s.includes(q)) &&
      (f.country === "All" || r.country === f.country) &&
      (f.city === "All" || r.city === f.city) &&
      (f.material === "All" || r.material === f.material) &&
      (f.primaryFunction === "All" || r.primaryFunction === f.primaryFunction) &&
      r.heightM >= f.minHeight && r.heightM <= f.maxHeight && r.completedYear >= f.minYear && r.completedYear <= f.maxYear;
  });
}
