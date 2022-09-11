import { DbTableName } from '@shared/enums';
import { DbColumn, DbEntity } from '../types';
import { IBaseModel } from './base-model';

export interface IDbContext {
  get<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  insert<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  update<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  hardDelete<T extends IBaseModel>(entity: DbEntity<T>): Promise<void>;
  migrateSchema(
    tables: Record<DbTableName, Record<string, DbColumn>>
  ): Promise<void>;
}
