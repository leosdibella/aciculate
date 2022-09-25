import { DbTableName, DbColumnType } from '../enums';

export type PrimaryKeyColumn = Readonly<{
  isPrimaryKey: true;
  type: DbColumnType.uuid;
  defaultValue: 'uuid_generate_v4()';
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  maxLength?: never;
  minLength?: never;
  isNullable?: never;
  isSecured?: true;
}>;

export type ForeignKeyColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.uuid;
  foreignKeyTable: DbTableName;
  foreignKeyColumn: string;
  cascadeOnDelete?: true;
  defaultValue?: never;
  isNullable?: true;
  isSecured?: true;
  maxLength?: never;
  minLength?: never;
}>;

export type BooleanColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.boolean;
  defaultValue: boolean;
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isNullable?: true;
  isSecured?: true;
  maxLength?: never;
  minLength?: never;
}>;

export type JsonColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.json;
  isNullable: true;
  defaultValue?: never;
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isSecured?: true;
  maxLength?: never;
  minLength?: never;
}>;

export type DateColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.date;
  defaultValue?: string;
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isNullable?: true;
  isSecured?: true;
  maxLength?: never;
  minLength?: never;
}>;

export type DateTimeColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.timestamptz;
  defaultValue: 'now()';
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isNullable?: true;
  isSecured?: true;
  maxLength?: never;
  minLength?: never;
}>;

export type StringColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.varchar;
  maxLength: number;
  minLength?: number;
  isNullable?: true;
  defaultValue?: string;
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isSecured?: true;
}>;

export type SmallIntegerColumn = Readonly<{
  isPrimaryKey?: never;
  type: DbColumnType.smallint;
  maxLength?: number;
  minLength?: number;
  isNullable?: true;
  defaultValue?: number;
  foreignKeyTable?: never;
  foreignKeyColumn?: never;
  cascadeOnDelete?: never;
  isSecured?: true;
}>;

export type DbColumn =
  | PrimaryKeyColumn
  | ForeignKeyColumn
  | BooleanColumn
  | JsonColumn
  | DateTimeColumn
  | StringColumn
  | SmallIntegerColumn
  | DateColumn;
