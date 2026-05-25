import type { Building } from "../types";

export function csvEscape(v: unknown) {
  const s = String(v ?? "");
  return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(rows: Building[]) {
  const headers = ["rank","name","city","country","heightM","heightFt","floors","completedYear","functionLabel","material","latitude","longitude","coordinatePrecision","recordSource","sourceUrl"];
  return [headers.join(","), ...rows.map((r) => [r.rank,r.name,r.city,r.country,r.heightM,r.heightFt,r.floors,r.completedYear,r.functionLabel,r.material,r.latitude,r.longitude,r.coordinatePrecision,r.recordSource,r.sourceUrl ?? ""].map(csvEscape).join(","))].join("\n");
}
