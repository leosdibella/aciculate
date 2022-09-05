import { DbTableName } from '@shared/enums';
import { DbColumnType } from '../enums';

export type PrimaryKeyColumn = Readonly<{
  isPrimaryKey: true;
  type: DbColumnType.uuid;
  defaultValue: 'uuid_generate_v4()';
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isNullable?: never;
}>;

export type ForeignKeyColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.uuid;
  foreignKeyTable: DbTableName;
  foreignKeyColumn: string;
  cascadeOnDelete?: boolean;
  defaultValue?: never;
  isNullable?: boolean;
}>;

export type BooleanColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.boolean;
  defaultValue: boolean;
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isNullable?: boolean;
}>;

export type JsonColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.json;
  isNullable: true;
  defaultValue?: never;
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
}>;

export type DateTimeColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.timestamptz;
  defaultValue: 'now()';
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isNullable?: boolean;
}>;

export type StringColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.varchar;
  maxLength: number;
  minLength?: number;
  isNullable?: boolean;
  defaultValue?: string;
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
}>;

export type DbColumn =
  | PrimaryKeyColumn
  | ForeignKeyColumn
  | BooleanColumn
  | JsonColumn
  | DateTimeColumn
  | StringColumn;
