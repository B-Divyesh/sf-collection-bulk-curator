import { editableFields, type CatalogRow, type ColumnMap, type RowChanges } from './types';

const mappingLabels: Record<keyof ColumnMap, string> = {
  id: 'Item ID',
  title: 'Display title',
  image: 'Thumbnail filename or URL',
  tags: 'Tags',
  location: 'Location',
  condition: 'Condition',
  collection: 'Collection'
};

export interface ExportTable {
  headers: string[];
  rows: Record<string, string>[];
}

export function mappingConflict(mapping: ColumnMap): string | null {
  const firstUse = new Map<string, keyof ColumnMap>();
  for (const [field, header] of Object.entries(mapping) as Array<[keyof ColumnMap, string]>) {
    if (!header) continue;
    const normalized = header.trim().toLocaleLowerCase();
    const previous = firstUse.get(normalized);
    if (previous) {
      return `The “${header}” column is mapped to both ${mappingLabels[previous]} and ${mappingLabels[field]}. Choose a different column or “Not included”.`;
    }
    firstUse.set(normalized, field);
  }
  return null;
}

export function unsafeIdCount(rows: Record<string, string>[], idHeader: string): number {
  return rows.filter((row) => (row[idHeader] ?? '').trim() === '').length;
}

export function buildChangeExport(
  mapping: ColumnMap,
  rows: CatalogRow[],
  changes: Record<string, RowChanges>,
  undo: boolean
): ExportTable {
  const activeFields = editableFields.filter((field) => Object.values(changes).some((rowChanges) => rowChanges[field]));
  const headers = [mapping.id, ...activeFields.map((field) => mapping[field] || field)];
  const normalized = new Set<string>();
  for (const header of headers) {
    const key = header.trim().toLocaleLowerCase();
    if (normalized.has(key)) {
      throw new Error(`Export stopped because the heading “${header}” would appear more than once. Map each edited field to a distinct source column.`);
    }
    normalized.add(key);
  }

  return {
    headers,
    rows: rows.filter((row) => changes[row.key]).map((row) => Object.fromEntries([
      [mapping.id, row.id],
      ...activeFields.map((field) => [
        mapping[field] || field,
        changes[row.key]?.[field]
          ? (undo ? changes[row.key]![field]!.before : changes[row.key]![field]!.after)
          : row[field]
      ])
    ]))
  };
}
