import { databaseMetadataKeys } from '@data';
import { IBaseModel } from '@interfaces';
import { DbEntity } from '@types';

export function userImmutable<T extends IBaseModel>(
  target: DbEntity<T>,
  propertyKey: Extract<keyof T, string>
) {
  const userImmutableDictionary: Extract<keyof T, string>[] =
    Reflect.getMetadata(databaseMetadataKeys.userImmutable, target) ?? [];

  userImmutableDictionary.push(propertyKey);

  Reflect.defineMetadata(
    databaseMetadataKeys.userImmutable,
    userImmutableDictionary,
    target
  );
}
