import { databaseMetadataKeys } from '@data/database-metadata-keys';
import { IBaseModel } from '@interfaces';
import { DbEntity } from '@types';

export function primaryKey<T extends IBaseModel>(
  target: DbEntity<T>,
  propertyKey: Extract<keyof T, string>
) {
  Reflect.defineMetadata(databaseMetadataKeys.primaryKey, propertyKey, target);
}
