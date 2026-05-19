import type { Building } from './data/buildings';

export function toCsv(rows: Building[]): string {
  const header = ['id', 'name', 'city', 'country', 'heightM', 'floors', 'year', 'lat', 'lng', 'status'];
  const body = rows.map((row) =>
    [row.id, row.name, row.city, row.country, row.heightM, row.floors, row.year, row.lat, row.lng, row.status]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(','),
  );

  return [header.join(','), ...body].join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
