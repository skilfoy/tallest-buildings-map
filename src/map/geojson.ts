import type { FeatureCollection, Point } from "geojson";
import type { Building } from "../types";

export function toFeatureCollection(rows: Building[]): FeatureCollection<Point> {
  return { type: "FeatureCollection", features: rows.map((r) => ({ type: "Feature", geometry: { type: "Point", coordinates: [r.longitude, r.latitude] }, properties: r })) };
}
