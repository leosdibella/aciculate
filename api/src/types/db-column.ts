import { DbTableName } from '@shared/enums';
import { DbColumnType } from '../enums';

export type PrimaryKeyColumn = Readonly<{
  isPrimaryKey: true;
  type: DbColumnType.uuid;
  defaultValue: 'uuid_generate_v4()';
}>;

export type ForeignKeyColumn = Readonly<{
  type: DbColumnType.uuid;
  foreignKeyTable: DbTableName;
  foreignKeyColumn: string;
  cascadeOnDelete?: boolean;
}>;

export type BooleanColumn = Readonly<{
  type: DbColumnType.boolean;
  defaultValue: boolean;
}>;

export type JsonColumn = Readonly<{
  type: DbColumnType.json;
  isNullable: true;
}>;

export type DateTimeColumn = Readonly<{
  type: DbColumnType.timestamptz;
  defaultValue: 'now()';
}>;

export type StringColumn = Readonly<{
  type: DbColumnType.varchar;
  length: number | 'MAX';
  isNullable?: boolean;
  defaultValue?: string;
}>;

export type DbColumn =
  | PrimaryKeyColumn
  | ForeignKeyColumn
  | BooleanColumn
  | JsonColumn
  | DateTimeColumn
  | StringColumn;
