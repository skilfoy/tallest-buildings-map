export type DataSource = "snapshot" | "cache" | "live";
export type CacheStatus = "missing" | "available" | "active" | "expired" | "invalid";
export type LiveStatus = "idle" | "loading" | "passed" | "failed" | "rejected";

export type Building = {
  id: string;
  rank: number;
  name: string;
  city: string;
  country: string;
  completedYear: number;
  heightM: number;
  heightFt: number;
  floors: number;
  material: string;
  functionLabel: string;
  primaryFunction: string;
  latitude: number;
  longitude: number;
  coordinatePrecision: string;
  recordSource: DataSource;
  sourceUrl?: string;
};

export type ValidationResult = {
  ok: boolean;
  validRecords: Building[];
  errors: string[];
  warnings: string[];
  returnedCount: number;
  validCount: number;
};

export type DatasetState = {
  activeSource: DataSource;
  activeFetchedAt: string;
  activeBuildings: Building[];
  snapshotCount: number;
  snapshotError?: string;
  cacheStatus: CacheStatus;
  liveStatus: LiveStatus;
  cacheExpiresAt?: string;
  liveAttemptedAt?: string;
  liveReturnedCount?: number;
  liveValidCount?: number;
  liveValidationErrors?: string[];
  liveValidationWarnings?: string[];
};

export type Filters = {
  query: string;
  country: string;
  city: string;
  material: string;
  primaryFunction: string;
  minHeight: number;
  maxHeight: number;
  minYear: number;
  maxYear: number;
};
