import { Entity, EntitySchema, ModelEntityName } from '@types';
import { IBaseModel } from '@interfaces/models';
import { ISeedData } from './seed-data';
import { IForeignKey } from './foreign-key';

export interface IEntityConstructor<T extends IBaseModel> {
  new (model: Partial<T>): Entity<T>;
  seed?(): ISeedData<T> | Promise<ISeedData<T>>;
  fromJson(json: string): Partial<T>;
  schema(): Readonly<EntitySchema<T>>;
  entityName(): ModelEntityName<T>;
  userImmutableFields(): Readonly<Extract<keyof T, string>[]>;
  primaryKey(): Extract<keyof T, string>;
  foreignKeys(): Readonly<
    Partial<Record<Extract<keyof T, string>, Readonly<IForeignKey>>>
  >;
}
