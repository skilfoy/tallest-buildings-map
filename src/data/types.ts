export type CoordinatePrecision = "exact" | "city" | "estimated" | "unknown";

export type Building = {
  id: string;
  rank: number;
  name: string;
  city: string;
  country: string;
  heightM: number;
  heightFt?: number | null;
  floors?: number | null;
  completedYear?: number | null;
  functionLabel?: string;
  material?: string;
  latitude: number;
  longitude: number;
  coordinatePrecision: CoordinatePrecision;
  source: "snapshot" | "live" | "cache";
  sourceUrl?: string;
};

export type CityCluster = {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  buildings: Building[];
  count: number;
  tallest: Building;
};

export type DashboardFilters = {
  query: string;
  country: string;
  city: string;
  minHeight: number;
  maxHeight: number;
  minYear: number;
  maxYear: number;
};

export type DataEnvelope = {
  source: "snapshot" | "live" | "cache";
  fetchedAt: string;
  ttlHours?: number;
  buildings: Building[];
};