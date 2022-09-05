import { Pool } from 'pg';
import format from 'pg-format';
import { DbEntity, DbEntitySchema } from '../types';
import { IBaseModel, IDbContext, IDbEntityStatic } from '../interfaces';
import {
  generateTableColumnDefinitions,
  getColumnNamesAndValues
} from './db-functions';
import { ApiError } from '@shared/classes';
import { ApiErrorCode } from '@shared/enums';

const pool = new Pool();

async function get<T extends Partial<IBaseModel>>(record: DbEntity<T>) {
  const EntityConstructor = record.constructor as IDbEntityStatic<T>;

  const query = format(
    `SELECT * FROM ${EntityConstructor.tableName} WHERE id = %L`,
    record.id
  );

  const result = await pool.query<Required<T>>(query);

  if (result.rows.length !== 1) {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databaseLookupError,
        message: `Record of type ${EntityConstructor.name} with id = '${record.id}' not found.`
      }
    ]);
  }

  return new EntityConstructor(result.rows[0]).toModel();
}

async function insert<T extends Partial<IBaseModel>>(record: DbEntity<T>) {
  record.validateInsert();

  const EntityConstructor = record.constructor as IDbEntityStatic<T>;
  const { columnNames, columnValues } = getColumnNamesAndValues(record);

  const query = format(
    `INSERT INTO ${
      EntityConstructor.tableName
    } (${columnNames.join()}) VALUES %L`,
    columnValues
  );

  const result = await pool.query(query);

  if (result.rows.length !== 1) {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Record of type ${
          EntityConstructor.name
        } with value '${record.toJson()}' could not be inserted.`
      }
    ]);
  }

  return new EntityConstructor(result.rows[0] as T).toModel();
}

async function update<T extends Partial<IBaseModel>>(record: DbEntity<T>) {
  const EntityConstructor = record.constructor as IDbEntityStatic<T>;
  const oldValue = await get(record);

  record.validateUpdate(oldValue);
  const { columnNames, columnValues } = getColumnNamesAndValues(record);

  columnNames.push('updatedDate' as DbEntitySchema<T>);
  columnValues.push(new Date());

  const setters = columnNames
    .map((cn, i) => format('%s = %L', cn, columnValues[i]))
    .join();

  const query = format(
    `UPDATE ${EntityConstructor.tableName} SET %s WHERE id = %L`,
    setters,
    record.id
  );

  const result = await pool.query<Required<T>>(query);

  if (result.rowCount !== 1) {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Record of type ${
          EntityConstructor.name
        } with value '${record.toJson()}' could not be updated.`
      }
    ]);
  }

  const newValue = { ...oldValue };

  columnNames.forEach((cn, i) => {
    newValue[cn] = columnValues[i] as DbEntity<T>[DbEntitySchema<T>];
  });

  return newValue;
}

async function hardDelete<T extends Partial<IBaseModel>>(record: DbEntity<T>) {
  const EntityConstructor = record.constructor as IDbEntityStatic<T>;

  const query = format(
    `DELETE FROM ${EntityConstructor.tableName} WHERE id = %L`,
    record.id
  );

  const result = await pool.query(query);

  if (result.rowCount !== 1) {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databaseDeleteError,
        message: `Record of type ${EntityConstructor.name} with id = '${record.id}' was not deleted.`
      }
    ]);
  }

  return;
}

export const databaseContext: IDbContext = {
  get,
  insert,
  update,
  hardDelete,
  async migrate(entities: IDbEntityStatic<IBaseModel>[]) {
    for (let i = 0; i < entities.length; ++i) {
      const EntityConstructor = entities[i];

      const columns = generateTableColumnDefinitions(
        EntityConstructor.tableName,
        EntityConstructor.schema
      );

      await pool.query(
        `CREATE TABLE IF NOT EXISTS ${
          EntityConstructor.tableName
        } (${columns.join(',\n')})`
      );
    }

    return;
  }
};
