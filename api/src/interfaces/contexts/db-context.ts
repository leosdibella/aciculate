import { DbEntity } from '@types';
import { IBaseModel } from '@interfaces/models';

export interface IDbContext {
  get<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  insert<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  update<T extends IBaseModel>(entity: DbEntity<T>): Promise<T>;
  hardDelete<T extends IBaseModel>(entity: DbEntity<T>): Promise<void>;
  migrate(): Promise<void>;
}
