import { describe, expect, it } from 'vitest';
import { parseCsv, toCsv } from './csv';

describe('CSV tools', () => {
  it('preserves IDs, commas, quotes, and newlines', () => {
    const parsed = parseCsv('id,title,note\r\n0007,"Cup, blue","Line 1\nLine 2"\r\n');
    expect(parsed.rows[0]?.id).toBe('0007');
    expect(parsed.rows[0]?.title).toBe('Cup, blue');
    expect(parsed.rows[0]?.note).toBe('Line 1\nLine 2');
    expect(parseCsv(toCsv(parsed.headers, parsed.rows))).toEqual(parsed);
  });

  it('rejects empty and duplicate headers', () => {
    expect(() => parseCsv('')).toThrow(/empty/i);
    expect(() => parseCsv('ID,id\n1,2')).toThrow(/more than once/i);
  });
});
