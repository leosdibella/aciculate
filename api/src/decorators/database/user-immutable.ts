import { databaseMetadataKeys } from '@data';
import { IBaseModel } from '@interfaces';
import { Entity } from '@types';

export const userImmutable: PropertyDecorator = <T extends IBaseModel>(
  target: Entity<T>,
  propertyKey: Extract<keyof T, string>
) => {
  const userImmutableDictionary: Extract<keyof T, string>[] =
    Reflect.getMetadata(databaseMetadataKeys.userImmutable, target) ?? [];

  userImmutableDictionary.push(propertyKey);

  Reflect.defineMetadata(
    databaseMetadataKeys.userImmutable,
    userImmutableDictionary,
    target
  );
};
