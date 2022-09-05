import { DbEntity } from '../types';
import { IBaseEntity } from './base-entity';
import { IDbEntityStatic } from './db-entity-static';

export interface IDbContext {
  insert<T extends Partial<IBaseEntity>>(
    record: DbEntity<T>
  ): Promise<Required<T>>;
  update<T extends Partial<IBaseEntity>>(
    record: DbEntity<T>
  ): Promise<Required<T>>;
  hardDelete<T extends Partial<IBaseEntity>>(
    record: DbEntity<T>
  ): Promise<void>;
  migrate(entities: IDbEntityStatic<IBaseEntity>[]): Promise<void>;
}
