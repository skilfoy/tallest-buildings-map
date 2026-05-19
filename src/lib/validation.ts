// @ts-nocheck
import { WORLD_SIZE, csvEscape, groupByCity, projectMercator, toCsv } from "./buildingMap";

export function runValidation(buildings) {
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
