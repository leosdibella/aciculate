import { databaseMetadataKeys } from '@data/database-metadata-keys';
import { IBaseModel, IForeignKey } from '@interfaces';
import { Constructor } from '@shared/types';
import { DbEntity } from '@types';

export function foreignKey<T extends IBaseModel>(
  definition: IForeignKey
): PropertyDecorator {
  return function foreignKeyDecorator<S extends T>(
    target: Constructor<DbEntity<S>>,
    proeprtyKey: Extract<keyof S, string>
  ) {
    const forgienKeyDictionary: Partial<
      Record<Extract<keyof S, string>, Readonly<IForeignKey>>
    > = Reflect.getMetadata(databaseMetadataKeys.forgienKey, target) ?? {};

    forgienKeyDictionary[proeprtyKey] = Object.freeze({
      tableName: definition.tableName,
      columnName: definition.columnName || 'id',
      cascadeOnDelete: definition.cascadeOnDelete
    });

    Reflect.defineMetadata(
      databaseMetadataKeys.forgienKey,
      forgienKeyDictionary,
      target
    );
  };
}
