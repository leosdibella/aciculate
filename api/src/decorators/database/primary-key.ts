import { databaseMetadataKeys } from '@data/database-metadata-keys';
import { IBaseModel } from '@interfaces';
import { Entity } from '@types';

export const primaryKey: PropertyDecorator = <T extends IBaseModel>(
  target: Entity<T>,
  propertyKey: Extract<keyof T, string>
) => {
  Reflect.defineMetadata(databaseMetadataKeys.primaryKey, propertyKey, target);
};
