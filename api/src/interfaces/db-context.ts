import { DbEntity, DbSchema, DbTable, IDbEntityConstructor } from '../types';
import { IBaseModel } from './base-model';
import { IDbSeedData } from './db-seed-data';

export interface IDbContext {
  get<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  insert<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  update<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  hardDelete<T extends IBaseModel>(entity: DbEntity<T>): Promise<void>;
  migrateSchema<T extends IBaseModel>(
    tableName: DbTable<T>,
    schema: DbSchema<T>
  ): Promise<void>;
  seed<T extends IBaseModel>(
    tableName: DbTable<IBaseModel>,
    dataFactory: () => IDbSeedData<T>,
    entityConstructor: IDbEntityConstructor<T>
  ): Promise<void>;
}
