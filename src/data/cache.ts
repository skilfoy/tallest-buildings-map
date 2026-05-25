import type { Building } from "../types";

const KEY = "tbm_cache_v1";
const TTL_MS = 24 * 60 * 60 * 1000;

export type CachePayload = { savedAt: string; expiresAt: string; buildings: Building[] };

export function saveCache(buildings: Building[]) {
  const savedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
  localStorage.setItem(KEY, JSON.stringify({ savedAt, expiresAt, buildings } satisfies CachePayload));
  return expiresAt;
}

export function readCache(): { status: "missing" | "expired" | "invalid" | "available"; payload?: CachePayload } {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { status: "missing" };
  try {
    const payload = JSON.parse(raw) as CachePayload;
    if (!Array.isArray(payload.buildings) || !payload.expiresAt) return { status: "invalid" };
    if (Date.parse(payload.expiresAt) < Date.now()) return { status: "expired", payload };
    return { status: "available", payload };
  } catch {
    return { status: "invalid" };
  }
}

export function clearCache() { localStorage.removeItem(KEY); }
