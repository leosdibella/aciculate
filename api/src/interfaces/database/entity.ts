import { EntityName } from '@enums';
import { IBaseModel } from '@interfaces/models';
import { EntitySchema } from '@types';

export interface IEntity<T extends IBaseModel> {
  validateInsert?(): void;
  validateUpdate?(model: T): void;
  toModel(): T;
  toJson(): string;
  fromJson(json: string): Partial<T>;
  readonly schema: EntitySchema<T>;
  readonly name: EntityName;
}
