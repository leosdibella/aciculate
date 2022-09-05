import { IBaseModel } from './base-model';

export interface IDbEntity<T extends Partial<IBaseModel>> {
  validateInsert(): void;
  validateUpdate(oldValue: Required<T>): void;
  toModel(): Required<T>;
  toJson(): string;
}
