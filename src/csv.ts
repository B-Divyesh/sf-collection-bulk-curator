export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsv(input: string): ParsedCsv {
  const text = input.replace(/^\uFEFF/, '');
  const table: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      table.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error('The CSV ends inside a quoted field. Check the final row and try again.');
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    table.push(row);
  }
  while (table.length && table.at(-1)?.every((cell) => cell.trim() === '')) table.pop();
  if (!table.length) throw new Error('This CSV is empty. Choose an export with a header row.');

  const rawHeaders = table.shift() ?? [];
  const headers = rawHeaders.map((header, index) => header.trim() || `Column ${index + 1}`);
  if (headers.length < 2) throw new Error('Only one column was found. Export the catalog as a comma-separated CSV.');
  const normalized = new Set<string>();
  for (const header of headers) {
    const key = header.toLocaleLowerCase();
    if (normalized.has(key)) throw new Error(`The header “${header}” appears more than once. Rename duplicate columns first.`);
    normalized.add(key);
  }

  const rows = table.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
  return { headers, rows };
}

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function toCsv(headers: string[], rows: Record<string, string>[]): string {
  return `\uFEFF${headers.map(escapeCell).join(',')}\r\n${rows
    .map((row) => headers.map((header) => escapeCell(row[header] ?? '')).join(','))
    .join('\r\n')}\r\n`;
}

export function suggestColumn(headers: string[], options: string[]): string {
  const found = headers.find((header) => options.includes(header.trim().toLocaleLowerCase()));
  return found ?? '';
}
