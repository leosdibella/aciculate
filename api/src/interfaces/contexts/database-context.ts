import { Entity } from '@types';
import { IBaseModel } from '@interfaces/models';

export interface IDatabaseContext {
  get<T extends IBaseModel>(entity: Entity<T>): Promise<T>;
  insert<T extends IBaseModel>(entity: Entity<T>): Promise<T>;
  update<T extends IBaseModel>(entity: Entity<T>): Promise<T>;
  hardDelete<T extends IBaseModel>(entity: Entity<T>): Promise<void>;
  migrate(): Promise<void>;
}
