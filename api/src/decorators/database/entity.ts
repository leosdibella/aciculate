import { databaseMetadataKeys } from '@data';
import { Entity, EntityNameModel } from '@types';
import { Constructor } from '@shared/types';
import { EntityName } from '@enums';

export function entity<
  T extends EntityName,
  S extends Constructor<Entity<EntityNameModel<T>>>
>(entityName: EntityName) {
  return function entityDecorator(target: S) {
    Reflect.defineMetadata(databaseMetadataKeys.entity, entityName, target);
  };
}
