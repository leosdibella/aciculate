import { DbColumn } from './db-column';

export type DbSchema<T> = Readonly<
  Record<
    Extract<keyof T, string>,
    Readonly<DbColumn> | string | Readonly<never[]>
  >
>;
