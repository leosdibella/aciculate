import { databaseMetadataKeys } from '@data/database-metadata-keys';
import { IBaseModel } from '@interfaces';
import { Entity } from '@types';

export function primaryKey<T extends IBaseModel>(
  target: Entity<T>,
  propertyKey: Extract<keyof T, string>
) {
  Reflect.defineMetadata(databaseMetadataKeys.primaryKey, propertyKey, target);
}
