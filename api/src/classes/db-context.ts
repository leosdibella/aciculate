import { Pool } from 'pg';
import format from 'pg-format';
import { DbEntity, IDbEntityConstructor } from '../types';
import { IBaseModel, IDbContext } from '../interfaces';
import {
  generateTableColumnDefinitions,
  getColumnNamesAndValues
} from '../utilities';
import { ApiError } from '@shared/classes';
import { ApiErrorCode } from '@shared/enums';

export class DbContext implements IDbContext {
  #pool = new Pool();

  async get<T extends IBaseModel>(entity: DbEntity<T>) {
    const query = format(
      `SELECT * FROM ${entity.tableName} WHERE id = %L`,
      entity.id
    );

    const result = await this.#pool.query<T>(query);

    if (result.rows.length !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseLookupError,
          message: `Record of type ${entity.tableName} with id = '${entity.id}' not found.`
        }
      ]);
    }

    return new (entity.constructor as IDbEntityConstructor<T>)(
      result.rows[0]
    ).toModel();
  }

  async insert<T extends IBaseModel>(entity: DbEntity<T>) {
    entity.validateInsert();

    const { columnNames, columnValues } = getColumnNamesAndValues(entity);

    const query = format(
      `INSERT INTO ${entity.tableName} (${columnNames.join()}) VALUES %L`,
      columnValues
    );

    const result = await this.#pool.query(query);

    if (result.rows.length !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseInsertError,
          message: `Record of type ${
            entity.tableName
          } with value '${entity.toJson()}' could not be inserted.`
        }
      ]);
    }

    return new (entity.constructor as IDbEntityConstructor<T>)(
      result.rows[0] as T
    ).toModel();
  }

  async update<T extends IBaseModel>(entity: DbEntity<T>) {
    const oldModel = await this.get(entity);

    entity.validateUpdate(oldModel);
    const { columnNames, columnValues } = getColumnNamesAndValues(entity);

    columnNames.push('updatedDate' as Extract<keyof T, string>);
    columnValues.push(new Date());

    const setters = columnNames
      .map((cn, i) => format('%s = %L', cn, columnValues[i]))
      .join();

    const query = format(
      `UPDATE ${entity.tableName} SET %s WHERE id = %L`,
      setters,
      entity.id
    );

    const result = await this.#pool.query<T>(query);

    if (result.rowCount !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseInsertError,
          message: `Record of type ${
            entity.tableName
          } with value '${entity.toJson()}' could not be updated.`
        }
      ]);
    }

    const newModel = { ...oldModel };

    columnNames.forEach((cn, i) => {
      newModel[cn] = columnValues[i] as T[Extract<keyof T, string>];
    });

    return newModel;
  }

  async hardDelete<T extends IBaseModel>(entity: DbEntity<T>) {
    const query = format(
      `DELETE FROM ${entity.tableName} WHERE id = %L`,
      entity.id
    );

    const result = await this.#pool.query(query);

    if (result.rowCount !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseDeleteError,
          message: `Record of type ${entity.tableName} with id = '${entity.id}' was not deleted.`
        }
      ]);
    }

    return;
  }

  async migrateSchema(entityConstructors: IDbEntityConstructor[]) {
    for (let i = 0; i < entityConstructors.length; ++i) {
      const EntityConstructor = entityConstructors[i];
      const entity = new EntityConstructor({});

      const columns = generateTableColumnDefinitions(
        entity.tableName,
        entity.schema
      );

      await this.#pool.query(
        `CREATE TABLE IF NOT EXISTS ${entity.tableName} (${columns.join(
          ',\n'
        )})`
      );
    }

    return;
  }
}
