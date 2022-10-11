import { DbEntity } from '@types';
import { IBaseModel } from '@interfaces/models';
import { IDbSeedData } from './db-seed-data';

export interface IDbEntityConstructor<T extends IBaseModel> {
  new (model: Partial<T>): DbEntity<T>;
  seed?(): IDbSeedData<T> | Promise<IDbSeedData<T>>;
  values?: Readonly<Readonly<Partial<T>>[]>;
}
