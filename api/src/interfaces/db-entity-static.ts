import { IBaseEntity } from './base-entity';
import { DbColumn, DbEntity, DbEntitySchema } from '../types';
import { DbTableName } from '@shared/enums';

export interface IDbEntityStatic<T extends Partial<IBaseEntity>> {
  new (entity: T): DbEntity<T>;
  tableName: DbTableName;
  schema: Record<DbEntitySchema<T>, DbColumn>;
  fromJson(json: Record<string, unknown>): Required<T>;
  immutableColumns: DbEntitySchema<T>[];
}
