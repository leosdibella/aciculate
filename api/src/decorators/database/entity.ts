import { databaseMetadataKeys } from '@data';
import { IDbEntity } from '@interfaces/database';
import { IBaseModel } from '@interfaces/models';
import { Constructor } from '@shared/types';

export function entity<T extends IBaseModel>(tableName?: string) {
  return function entityDecorator<S extends T>(
    target: Constructor<IDbEntity<S>>
  ) {
    const defaultTableName = toPascalCase(target.name.split('Entity')[0]);

    Reflect.defineMetadata(
      databaseMetadataKeys.tableName,
      tableName ?? defaultTableName,
      target
    );
  };
}
