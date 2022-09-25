import { DbTableName } from '../enums';
import { DbEntity, DbSchema } from '../types';
import { IBaseModel } from './base-model';

export interface IDbContext {
  get<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  insert<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  update<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  hardDelete<T extends IBaseModel>(entity: DbEntity<T>): Promise<void>;
  migrateSchema<T extends IBaseModel>(
    tableName: DbTableName,
    schema: DbSchema<T>
  ): Promise<void>;
}
