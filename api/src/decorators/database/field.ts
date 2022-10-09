import { databaseMetadataKeys } from '@data/database-metadata-keys';
import { IBaseModel } from '@interfaces/models';
import { Constructor } from '@shared/types';
import { DbColumn, DbEntity, DbSchema } from '@types';

export function field<T extends IBaseModel>(
  column: DbColumn
): PropertyDecorator {
  return function fieldDecorator<S extends T>(
    target: Constructor<DbEntity<S>>,
    propertyKey: Extract<keyof S, string>
  ) {
    const columnDictionary: Partial<DbSchema<S>> =
      Reflect.getMetadata(databaseMetadataKeys.field, target) ?? {};

    columnDictionary[propertyKey] = Object.freeze(column);

    Reflect.defineMetadata(
      databaseMetadataKeys.field,
      columnDictionary,
      target
    );
  };
}
