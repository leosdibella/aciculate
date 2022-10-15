import { databaseMetadataKeys } from '@data/database-metadata-keys';
import { IBaseModel, IForeignKey } from '@interfaces';
import { Entity } from '@types';

export function foreignKey<T extends IBaseModel>(
  definition: IForeignKey
): PropertyDecorator {
  return function foreignKeyDecorator<S extends T>(
    target: Entity<S>,
    proeprtyKey: Extract<keyof S, string>
  ) {
    const forgienKeyDictionary: Partial<
      Record<Extract<keyof S, string>, Readonly<IForeignKey>>
    > = Reflect.getMetadata(databaseMetadataKeys.forgienKey, target) ?? {};

    forgienKeyDictionary[proeprtyKey] = Object.freeze<IForeignKey>({
      entityName: definition.entityName,
      fieldName: definition.fieldName || 'id',
      cascadeOnDelete: definition.cascadeOnDelete
    });

    Reflect.defineMetadata(
      databaseMetadataKeys.forgienKey,
      forgienKeyDictionary,
      target
    );
  };
}
