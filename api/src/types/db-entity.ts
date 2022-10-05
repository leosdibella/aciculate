import { IBaseModel, IDbEntity } from '@interfaces';

export type DbEntity<T extends IBaseModel> = IDbEntity<T> &
  Readonly<Partial<T>>;
