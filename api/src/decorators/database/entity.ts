import { databaseMetadataKeys } from '@data';
import { Entity, EntityNameModel } from '@types';
import { Constructor } from '@shared/types';
import { EntityName } from '@enums';

export function entity<T extends EntityName>(entityName: T) {
  return function entityDecorator(
    target: Constructor<Entity<EntityNameModel<T>>>
  ) {
    Reflect.defineMetadata(databaseMetadataKeys.entity, entityName, target);
  };
}
