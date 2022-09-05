import { IBaseEntity, IDbEntity } from '../interfaces';

export type DbEntitySchema<T extends Partial<IBaseEntity>> = Exclude<
  keyof T,
  keyof IDbEntity<T>
> &
  string;
