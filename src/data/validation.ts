import type { Building, ValidationResult } from "../types";

const anchors = ["Burj Khalifa", "Merdeka 118", "Shanghai Tower"];

export function validateBuildingDataset(input: Building[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validRecords = input.filter((r) =>
    r.id && r.name && r.country && Number.isFinite(r.heightM) && r.heightM >= 200 && r.heightM <= 1000 && Number.isFinite(r.latitude) && Number.isFinite(r.longitude),
  );
  if (!input.length) errors.push("Dataset is empty.");
  if (validRecords.length < 50) errors.push(`Need at least 50 valid records; found ${validRecords.length}.`);
  const countryCount = new Set(validRecords.map((r) => r.country)).size;
  if (countryCount < 5) warnings.push(`Only ${countryCount} countries present.`);
  const tallest = Math.max(0, ...validRecords.map((r) => r.heightM));
  if (tallest < 700) warnings.push(`Tallest record ${tallest}m is below expected global anchor threshold.`);
  for (const name of anchors) {
    if (!validRecords.some((r) => r.name === name)) errors.push(`Missing anchor record: ${name}.`);
  }
  return { ok: errors.length === 0, validRecords, errors, warnings, returnedCount: input.length, validCount: validRecords.length };
}
