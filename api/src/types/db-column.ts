import { DbColumnType } from '@enums';

export type PrimaryKeyColumn = Readonly<{
  readonly type: DbColumnType.uuid;
  readonly defaultValue: 'uuid_generate_v4()';
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly isNullable?: never;
  readonly isSecured?: true;
  readonly validate?: never;
}>;

export type ForeignKeyColumn = Readonly<{
  readonly type: DbColumnType.uuid;
  readonly defaultValue?: never;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly validate?: never;
}>;

export type BooleanColumn = Readonly<{
  readonly type: DbColumnType.boolean;
  readonly defaultValue?: boolean;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly validate?: never;
}>;

export type JsonColumn = Readonly<{
  readonly type: DbColumnType.json;
  readonly isNullable: true;
  readonly defaultValue?: never;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  validate?(value: string): void;
}>;

export type DateColumn = Readonly<{
  readonly type: DbColumnType.date;
  readonly defaultValue?: string;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  validate?(value: Date): void;
}>;

export type DateTimeColumn = Readonly<{
  readonly type: DbColumnType.timestamptz;
  readonly defaultValue: 'now()';
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  validate?(value: Date): void;
}>;

export type StringColumn = Readonly<{
  readonly type: DbColumnType.varchar;
  readonly maxLength: number;
  readonly minLength?: number;
  readonly isNullable?: true;
  readonly defaultValue?: string;
  readonly isSecured?: true;
  validate?(value: string): void;
}>;

export type SmallIntegerColumn = Readonly<{
  readonly type: DbColumnType.smallint;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly isNullable?: true;
  readonly defaultValue?: number;
  readonly isSecured?: true;
  validate?(value: number): void;
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
