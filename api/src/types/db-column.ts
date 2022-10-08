import { DbTableName, DbColumnType } from '@enums';

export type PrimaryKeyColumn = Readonly<{
  readonly isPrimaryKey: true;
  readonly type: DbColumnType.uuid;
  readonly defaultValue: 'uuid_generate_v4()';
  readonly foreignKeyTable?: never;
  readonly foreignKeyColumn?: never;
  readonly cascadeOnDelete?: never;
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly isNullable?: never;
  readonly isSecured?: true;
}>;

export type ForeignKeyColumn = Readonly<{
  readonly isPrimaryKey?: never;
  readonly type: DbColumnType.uuid;
  readonly foreignKeyTable: DbTableName;
  readonly foreignKeyColumn: string;
  readonly cascadeOnDelete?: true;
  readonly defaultValue?: never;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
}>;

export type BooleanColumn = Readonly<{
  readonly isPrimaryKey?: never;
  readonly type: DbColumnType.boolean;
  readonly defaultValue: boolean;
  readonly foreignKeyTable?: never;
  readonly foreignKeyColumn?: never;
  readonly cascadeOnDelete?: never;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
}>;

export type JsonColumn = Readonly<{
  readonly isPrimaryKey?: never;
  readonly type: DbColumnType.json;
  readonly isNullable: true;
  readonly defaultValue?: never;
  readonly foreignKeyTable?: never;
  readonly foreignKeyColumn?: never;
  readonly cascadeOnDelete?: never;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
}>;

export type DateColumn = Readonly<{
  readonly isPrimaryKey?: never;
  readonly type: DbColumnType.date;
  readonly defaultValue?: string;
  readonly foreignKeyTable?: never;
  readonly foreignKeyColumn?: never;
  readonly cascadeOnDelete?: never;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
}>;

export type DateTimeColumn = Readonly<{
  readonly isPrimaryKey?: never;
  readonly type: DbColumnType.timestamptz;
  readonly defaultValue: 'now()';
  readonly foreignKeyTable?: never;
  readonly foreignKeyColumn?: never;
  readonly cascadeOnDelete?: never;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
}>;

export type StringColumn = Readonly<{
  readonly isPrimaryKey?: never;
  readonly type: DbColumnType.varchar;
  readonly maxLength: number;
  readonly minLength?: number;
  readonly isNullable?: true;
  readonly defaultValue?: string;
  readonly foreignKeyTable?: never;
  readonly foreignKeyColumn?: never;
  readonly cascadeOnDelete?: never;
  readonly isSecured?: true;
}>;

export type SmallIntegerColumn = Readonly<{
  readonly isPrimaryKey?: never;
  readonly type: DbColumnType.smallint;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly isNullable?: true;
  readonly defaultValue?: number;
  readonly foreignKeyTable?: never;
  readonly foreignKeyColumn?: never;
  readonly cascadeOnDelete?: never;
  readonly isSecured?: true;
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
