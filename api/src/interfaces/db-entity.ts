import { DbTableName } from '@shared/enums';
import { DbColumn } from '../types';
import { IBaseModel } from './base-model';

export interface IDbEntity<T extends IBaseModel> {
  validateInsert(): void;
  validateUpdate(model: T): void;
  toModel(): T;
  toJson(): string;
  fromJson(json: Record<string, unknown>): Partial<T>;
  readonly tableName: DbTableName;
  readonly schema: Readonly<
    Record<Extract<keyof T, string>, Readonly<DbColumn>>
  >;
  readonly immutableColumns: Readonly<Extract<keyof T, string>[]>;
}
