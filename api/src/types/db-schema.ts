import { DbColumn } from './db-column';

export type DbSchema<T> = Partial<
  Record<Extract<keyof T, string>, Readonly<DbColumn>>
>;
