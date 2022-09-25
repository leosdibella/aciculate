import { Pool } from 'pg';
import format from 'pg-format';
import { DbEntity, DbSchema, DbTable } from '../types';
import { IBaseModel, IDbContext, IDbEntityConstructor } from '../interfaces';
import {
  generateTableColumnDefinitions,
  getColumnNamesAndValues,
  validateColumnValues
} from '../utilities';
import { ApiError } from '@shared/classes';
import { ApiErrorCode } from '@shared/enums';

export class DbContext implements IDbContext {
  #pool = new Pool();

  async get<T extends IBaseModel>(entity: DbEntity<T>) {
    const query = format(
      `SELECT * FROM ${entity.tableName} WHERE id = %L;`,
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
    if (entity.validateInsert) {
      entity.validateInsert();
    } else {
      validateColumnValues(entity);
    }

    const { columnNames, columnValues } = getColumnNamesAndValues(entity);

    const query = format(
      `INSERT INTO ${entity.tableName} (${columnNames.join()}) VALUES %L;`,
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

    if (entity.validateUpdate) {
      entity.validateUpdate(oldModel);
    } else {
      validateColumnValues(entity, oldModel);
    }

    const { columnNames, columnValues } = getColumnNamesAndValues(entity);

    columnNames.push('updatedDate' as Extract<keyof T, string>);
    columnValues.push(new Date());

    const setters = columnNames
      .map((cn, i) => format('%s = %L', cn, columnValues[i]))
      .join();

    const query = format(
      `UPDATE ${entity.tableName} SET %s WHERE id = %L;`,
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
      `DELETE FROM ${entity.tableName} WHERE id = %L;`,
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

  async migrateSchema<T extends IBaseModel>(
    tableName: DbTable<T>,
    schema: DbSchema<T>
  ) {
    const { columns, indexes } = generateTableColumnDefinitions(
      tableName,
      schema
    );

    await this.#pool.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(',\n')});`
    );

    for (let i = 0; i < indexes.length; ++i) {
      await this.#pool.query(indexes[i]);
    }

    return;
  }

  async seed<T extends IBaseModel>(entityConstructor: IDbEntityConstructor<T>) {
    if (!entityConstructor.seed && !entityConstructor.seedAsync) {
      return;
    }

    const seedData = entityConstructor.seedAsync
      ? await entityConstructor.seedAsync()
      : entityConstructor.seed!();

    const values: T[] = [];

    for (let i = 0; i < seedData.conditions.length; ++i) {
      const conditions = seedData.conditions
        .map((c, j) => format('%s = %L', c, seedData.values[j][c]))
        .join(' AND ');

      const query = format(
        `SELECT * FROM ${entityConstructor.tableName} WHERE %s;`,
        conditions
      );

      const result = await this.#pool.query(query);

      if (result.rows.length > 0) {
        continue;
      }

      // eslint-disable-next-line new-cap
      values.push(await this.insert(new entityConstructor(seedData.values[i])));
    }

    if (seedData.storeValues && entityConstructor.values !== undefined) {
      entityConstructor.values = Object.freeze(
        values.map((v) => Object.freeze(v))
      );
    }

    return;
  }
}
