import { DbEntity } from '@types';
import { IBaseModel } from '@interfaces/models';
import { DbTableName } from '@enums';
import { IDbSeedData } from './db-seed-data';

export interface IDbEntityConstructor<T extends IBaseModel> {
  new (model: Partial<T>): DbEntity<T>;
  seed?(): IDbSeedData<T>;
  seedAsync?(): Promise<IDbSeedData<T>>;
  tableName: DbTableName;
  values?: Readonly<Readonly<Partial<T>>[]>;
}