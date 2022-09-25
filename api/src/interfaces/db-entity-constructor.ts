import { DbEntity } from '../types/db-entity';
import { IBaseModel, IDbSeedData } from '.';
import { DbTableName } from 'src/enums';

export interface IDbEntityConstructor<T extends IBaseModel> {
  new (model: Partial<T>): DbEntity<T>;
  seed?(): IDbSeedData<T>;
  seedAsync?(): Promise<IDbSeedData<T>>;
  tableName: DbTableName;
  values?: Readonly<Readonly<Partial<T>>[]>;
}
