import { describe, expect, it } from 'vitest';
import { buildChangeExport, mappingConflict, unsafeIdCount } from './catalog';
import type { CatalogRow, ColumnMap, RowChanges } from './types';

const mapping: ColumnMap = {
  id: 'ID', title: 'Title', image: '', tags: 'Tags', location: 'Location', condition: 'Condition', collection: 'Collection'
};
const row: CatalogRow = {
  key: '0:0007', sourceIndex: 0, raw: {}, id: '0007', title: 'Vase', image: '', tags: 'ceramic', location: 'Shelf 2', condition: 'Good', collection: 'Ceramics'
};

describe('catalog safety', () => {
  it('rejects one source column mapped to multiple semantics', () => {
    expect(mappingConflict({ ...mapping, tags: 'ID' })).toBe(
      'The “ID” column is mapped to both Item ID and Tags. Choose a different column or “Not included”.'
    );
    expect(mappingConflict(mapping)).toBeNull();
  });

  it('treats whitespace-only IDs as blank without trimming valid ID bytes', () => {
    expect(unsafeIdCount([{ ID: '   ' }, { ID: '\t' }, { ID: ' 0007 ' }], 'ID')).toBe(2);
    const changes: Record<string, RowChanges> = { [row.key]: { tags: { before: 'ceramic', after: 'ceramic, priority' } } };
    expect(buildChangeExport(mapping, [{ ...row, id: ' 0007 ' }], changes, false).rows[0]?.ID).toBe(' 0007 ');
  });

  it('builds exact reversible output while retaining the source ID', () => {
    const changes: Record<string, RowChanges> = { [row.key]: { tags: { before: 'ceramic', after: 'ceramic, priority' } } };
    expect(buildChangeExport(mapping, [row], changes, false)).toEqual({
      headers: ['ID', 'Tags'], rows: [{ ID: '0007', Tags: 'ceramic, priority' }]
    });
    expect(buildChangeExport(mapping, [row], changes, true)).toEqual({
      headers: ['ID', 'Tags'], rows: [{ ID: '0007', Tags: 'ceramic' }]
    });
  });

  it('stops export if corrupted or legacy state would emit duplicate headings', () => {
    const changes: Record<string, RowChanges> = { [row.key]: { tags: { before: 'ceramic', after: 'ceramic, priority' } } };
    expect(() => buildChangeExport({ ...mapping, tags: 'ID' }, [row], changes, false)).toThrow(/heading “ID” would appear more than once/);
    expect(() => buildChangeExport({ ...mapping, tags: 'ID' }, [row], changes, true)).toThrow(/heading “ID” would appear more than once/);
  });
});
