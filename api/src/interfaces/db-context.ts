import { DbEntity } from '../types';
import { IBaseModel } from './base-model';
import { IDbEntityStatic } from './db-entity-static';

export interface IDbContext {
  get<T extends Partial<IBaseModel>>(record: DbEntity<T>): Promise<Required<T>>;
  insert<T extends Partial<IBaseModel>>(
    record: DbEntity<T>
  ): Promise<Required<T>>;
  update<T extends Partial<IBaseModel>>(
    record: DbEntity<T>
  ): Promise<Required<T>>;
  hardDelete<T extends Partial<IBaseModel>>(record: DbEntity<T>): Promise<void>;
  migrate(entities: IDbEntityStatic<IBaseModel>[]): Promise<void>;
}
