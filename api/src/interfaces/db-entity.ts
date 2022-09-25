import { DbTableName } from '../enums';
import { DbSchema } from '../types';
import { IBaseModel } from './base-model';

export interface IDbEntity<T extends IBaseModel> {
  validateInsert?(): void;
  validateUpdate?(model: T): void;
  toModel(): T;
  toJson(): string;
  fromJson(json: string): Partial<T>;
  readonly tableName: DbTableName;
  readonly schema: DbSchema<T>;
  readonly immutableColumns?: Readonly<Extract<keyof T, string>[]>;
}
