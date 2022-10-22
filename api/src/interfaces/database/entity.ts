import { IBaseModel } from '@interfaces/models';

export interface IEntity<T extends IBaseModel> {
  validateInsert?(): void;
  validateUpdate?(model: T): void;
  toModel(): T;
  toJson(): string;
}
