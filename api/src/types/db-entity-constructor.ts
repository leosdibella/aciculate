import { DbEntity } from './db-entity';
import { IBaseModel } from '../interfaces';

export type IDbEntityConstructor<T extends IBaseModel> = new (
  model: Partial<T>
) => DbEntity<T>;
