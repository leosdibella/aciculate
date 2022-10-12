import { databaseMetadataKeys } from '@data/database-metadata-keys';
import { IBaseModel } from '@interfaces/models';
import { Constructor } from '@shared/types';
import { Field, Entity, EntitySchema } from '@types';

export function field<T extends IBaseModel>(
  entityField: Field
): PropertyDecorator {
  return function fieldDecorator<S extends T>(
    target: Constructor<Entity<S>>,
    propertyKey: Extract<keyof S, string>
  ) {
    const fieldDictionary: Partial<EntitySchema<S>> =
      Reflect.getMetadata(databaseMetadataKeys.field, target) ?? {};

    fieldDictionary[propertyKey] = Object.freeze<Field>(entityField);

    Reflect.defineMetadata(databaseMetadataKeys.field, fieldDictionary, target);
  };
}
