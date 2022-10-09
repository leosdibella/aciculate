import { IBaseModel } from '@interfaces/models';

export interface IDbEntity<T extends IBaseModel> {
  validateInsert?(): void;
  validateUpdate?(model: T): void;
  toModel(): T;
  toJson(): string;
  fromJson(json: string): Partial<T>;
}
