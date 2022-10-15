import { IBaseModel } from '@interfaces/models';
import { EntitySchema, ModelEntityName } from '@types';
import { IForeignKey } from './foreign-key';

export interface IEntity<T extends IBaseModel> {
  validateInsert?(): void;
  validateUpdate?(model: T): void;
  toModel(): T;
  toJson(): string;
  fromJson(json: string): Partial<T>;
  readonly schema: Readonly<EntitySchema<T>>;
  readonly name: ModelEntityName<T>;
  readonly userImmutableFields: Readonly<Extract<keyof T, string>[]>;
  readonly primaryKey: Extract<keyof T, string>;
  readonly foreignKeys: Readonly<
    Partial<Record<Extract<keyof T, string>, Readonly<IForeignKey>>>
  >;
}
