import { IBaseModel, IDbEntity } from '../interfaces';

export type DbEntitySchema<T extends Partial<IBaseModel>> = Exclude<
  keyof T,
  keyof IDbEntity<T>
> &
  string;
