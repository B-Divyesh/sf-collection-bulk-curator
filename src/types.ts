export const editableFields = ['tags', 'location', 'condition', 'collection'] as const;
export type EditableField = (typeof editableFields)[number];

export interface ColumnMap {
  id: string;
  title: string;
  image: string;
  tags: string;
  location: string;
  condition: string;
  collection: string;
}

export interface CatalogRow {
  key: string;
  sourceIndex: number;
  raw: Record<string, string>;
  id: string;
  title: string;
  image: string;
  tags: string;
  location: string;
  condition: string;
  collection: string;
}

export interface FieldChange {
  before: string;
  after: string;
}

export type RowChanges = Partial<Record<EditableField, FieldChange>>;

export interface ChangeBatch {
  id: string;
  keys: string[];
  field: EditableField;
  previous: Array<{ key: string; change?: FieldChange }>;
  label: string;
}
