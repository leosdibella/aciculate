import { IBaseModel } from './base-model';
import { DbColumn, DbEntity, DbEntitySchema } from '../types';
import { DbTableName } from '@shared/enums';

export interface IDbEntityStatic<T extends Partial<IBaseModel>> {
  new (entity: T): DbEntity<T>;
  readonly tableName: DbTableName;
  readonly schema: Readonly<Record<DbEntitySchema<T>, Readonly<DbColumn>>>;
  fromJson(json: Record<string, unknown>): T;
  readonly immutableColumns: Readonly<DbEntitySchema<T>[]>;
}
