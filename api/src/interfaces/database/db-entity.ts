import { DbTableName } from '@enums';
import { IBaseModel } from '@interfaces/models';
import { DbSchema } from '@types';

export interface IDbEntity<T extends IBaseModel> {
  validateInsert?(): void;
  validateUpdate?(model: T): void;
  toModel(): T;
  toJson(): string;
  fromJson(json: string): Partial<T>;
  readonly schema: DbSchema<T>;
  readonly tableName: DbTableName;
}
