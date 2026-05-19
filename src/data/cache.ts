import type { Building, DataEnvelope } from "./types";

const CACHE_KEY = "tallest-buildings-map:v2";
const TTL_MS = 24 * 60 * 60 * 1000;

type CachedPayload = {
  fetchedAt: string;
  buildings: Building[];
};

export function readCachedBuildings(): DataEnvelope | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedPayload;
    const fetchedAtMs = Date.parse(parsed.fetchedAt);

    if (!Number.isFinite(fetchedAtMs)) return null;
    if (Date.now() - fetchedAtMs > TTL_MS) return null;
    if (!Array.isArray(parsed.buildings)) return null;

    return {
      source: "cache",
      fetchedAt: parsed.fetchedAt,
      ttlHours: 24,
      buildings: parsed.buildings.map((building) => ({
        ...building,
        source: "cache",
      })),
    };
  } catch {
    return null;
  }
}

export function writeCachedBuildings(buildings: Building[]): void {
  try {
    const payload: CachedPayload = {
      fetchedAt: new Date().toISOString(),
      buildings,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Browser storage can fail in private mode or under quota pressure.
  }
}

export function clearBuildingCache(): void {
  localStorage.removeItem(CACHE_KEY);
}