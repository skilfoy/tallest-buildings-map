import { describe, expect, it } from "vitest";
import { parseRawData, RAW_DATA } from "../data/staticData";
import { validateBuildingDataset } from "../data/validation";
import { applyFilters, getBounds } from "./filters";
import { csvEscape } from "./csv";
import { toFeatureCollection } from "../map/geojson";

describe("validation", () => {
  const rows = parseRawData(RAW_DATA, "snapshot");
  it("accepts plausible dataset", () => expect(validateBuildingDataset(rows).ok).toBe(true));
  it("rejects empty", () => expect(validateBuildingDataset([]).ok).toBe(false));
  it("rejects degenerate coordinates", () => {
    const bad = rows.map((r) => ({ ...r, latitude: 0, longitude: 0 }));
    expect(validateBuildingDataset(bad).ok).toBe(false);
  });
  it("rejects implausible", () => {
    const bad = rows.slice(0, 5).map((r) => ({ ...r, heightM: 50 }));
    expect(validateBuildingDataset(bad).ok).toBe(false);
  });
});

describe("filters/csv/geojson", () => {
  const rows = parseRawData(RAW_DATA, "snapshot");
  const b = getBounds(rows);
  it("returns finite bounds for empty rows", () => {
    expect(getBounds([])).toEqual({ minHeight: 0, maxHeight: 0, minYear: 0, maxYear: 0 });
  });
  it("applies search/country", () => {
    const out = applyFilters(rows, { query: "burj", country: "United Arab Emirates", city: "All", material: "All", primaryFunction: "All", ...b });
    expect(out.some((r) => r.name === "Burj Khalifa")).toBe(true);
  });
  it("escapes csv", () => expect(csvEscape('A,"B"')).toBe('"A,""B"""'));
  it("converts geojson", () => expect(toFeatureCollection(rows).features.length).toBe(rows.length));
});
