// @ts-nocheck
import { CITY_COORDINATES } from "../data/buildings";

export const TILE_ZOOM = 2;
export const TILE_SIZE = 256;
export const WORLD_SIZE = TILE_SIZE * Math.pow(2, TILE_ZOOM);
export const TILE_INDICES = Array.from({ length: Math.pow(2, TILE_ZOOM) }, (_, index) => index);

export const palette = ["#2563eb", "#7c3aed", "#ea580c", "#059669", "#dc2626", "#0891b2", "#db2777", "#475569", "#ca8a04", "#0f766e"];

export function colorForCountry(country, countries) {
  const index = countries.indexOf(country);
  return palette[index % palette.length] ?? "#0f172a";
}

export function projectMercator(lat, lon, zoom = TILE_ZOOM) {
  const sinLatitude = Math.sin((lat * Math.PI) / 180);
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = ((lon + 180) / 360) * scale;
  const y = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale;
  return { x, y };
}

export function parseBuildings(rawText) {
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

export function groupByCity(rows) {
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

export function csvEscape(value) {
  const stringValue = String(value ?? "");
  const needsEscaping = stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"');
  if (!needsEscaping) return stringValue;
  return `"${stringValue.split('"').join('""')}"`;
}

export function toCsv(rows) {
  const headers = ["rank", "name", "city", "country", "completed", "heightM", "heightFt", "floors", "material", "function", "latitude", "longitude", "coordinatePrecision"];
  const csvRows = rows.map((row) => [row.rank, row.name, row.city, row.country, row.completed, row.heightM, row.heightFt, row.floors, row.material, row.function, row.lat, row.lon, row.coordinatePrecision].map(csvEscape).join(","));
  return [headers.join(","), ...csvRows].join("\n");
}

export function downloadCsv(rows) {
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
