import { Entity } from '@types';
import { IBaseModel } from '@interfaces/models';
import { ISeedData } from './seed-data';

export interface IEntityConstructor<T extends IBaseModel> {
  new (model: Partial<T>): Entity<T>;
  seed?(): ISeedData<T> | Promise<ISeedData<T>>;
  values?: Readonly<Readonly<Partial<T>>[]>;
}
