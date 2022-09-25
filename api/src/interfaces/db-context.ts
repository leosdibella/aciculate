import { DbEntity, DbSchema, DbTable } from '../types';
import { IBaseModel } from './base-model';
import { IDbEntityConstructor } from './db-entity-constructor';

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
    entityConstructor: IDbEntityConstructor<T>
  ): Promise<void>;
}
