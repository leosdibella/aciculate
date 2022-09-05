import { Pool } from 'pg';
import {
  DbColumn,
  DbEntity,
  DbEntitySchema,
  StringColumn,
  PrimaryKeyColumn,
  ForeignKeyColumn
} from '../types';
import { IBaseEntity, IDbContext, IDbEntityStatic } from '../interfaces';
import { dbSerializeDate, dbSerializeField } from './db-functions';
import { DbColumnType } from '../enums';

const pool = new Pool();

function generateTableColumnDefinitions<T extends Partial<IBaseEntity>>(
  schema: Record<DbEntitySchema<T>, DbColumn>
): string[] {
  const columns: string[] = [];

  (Object.keys(schema) as (keyof typeof schema)[]).forEach((k) => {
    const column = schema[k];

    const typeLength =
      column.type === DbColumnType.varchar ? `(${column.length})` : '';

    const typeText = `${column.type}${typeLength}`;

    const primaryKeyText = (column as PrimaryKeyColumn).isPrimaryKey
      ? ' PRIMARY KEY '
      : '';

    const nullableText =
      (column as StringColumn).isNullable || primaryKeyText ? '' : ' NOT NULL ';

    const defaultText =
      (column as StringColumn).defaultValue !== undefined
        ? ` DEFAULT ${(column as StringColumn).defaultValue} `
        : '';

    const forgienKeyText = (column as ForeignKeyColumn).foreignKeyTable
      ? ` REFERENCES ${(column as ForeignKeyColumn).foreignKeyTable}(${
          (column as ForeignKeyColumn).foreignKeyColumn
        }) `
      : '';

    const casecadeText = (column as ForeignKeyColumn).cascadeOnDelete
      ? ' ON DELETE CASCADE '
      : '';

    columns.push(
      `${k} ${typeText}${primaryKeyText}${nullableText}${defaultText}${forgienKeyText}${casecadeText};`
    );
  });

  return columns;
}

export const databaseContext: IDbContext = {
  async insert<T extends Partial<IBaseEntity>>(record: DbEntity<T>) {
    const errorMessage = record.isValidInsert();
    const constructor = record.constructor as unknown as IDbEntityStatic<T>;
    const columns: DbEntitySchema<T>[] = [];
    const values: string[] = [];

    if (errorMessage) {
      throw Error(errorMessage);
    }

    if (typeof constructor.tableName !== 'string' || !constructor.tableName) {
      throw Error(
        `${record.constructor.name} is not of type IDbEntityStatic and is missing a tableName.`
      );
    }

    if (typeof constructor.schema !== 'object' || !constructor.schema) {
      throw Error(
        `${record.constructor.name} is not of type IDbEntityStatic and is missing a schema.`
      );
    }

    (Object.keys(constructor.schema) as DbEntitySchema<T>[])
      .filter((k) => constructor.immutableColumns.indexOf(k) === -1)
      .forEach((k) => {
        const value = dbSerializeField(k, record);

        if (value !== undefined) {
          columns.push(k);
          values.push(value);
        }
      });

    const result = await pool.query(
      `INSERT INTO ${
        constructor.tableName
      } (${columns.join()}) VALUES (${values.join()})`
    );

    if (result.rows.length !== 1) {
      throw Error();
    }

    return new (record.constructor as IDbEntityStatic<T>)(
      result.rows[0] as T
    ).toModel();
  },
  async update<T extends Partial<IBaseEntity>>(record: DbEntity<T>) {
    const constructor = record.constructor as unknown as IDbEntityStatic<T>;

    if (typeof constructor.tableName !== 'string' || !constructor.tableName) {
      throw Error(
        `${record.constructor.name} is not of type IDbEntityStatic and is missing a tableName.`
      );
    }

    if (typeof constructor.schema !== 'object' || !constructor.schema) {
      throw Error(
        `${record.constructor.name} is not of type IDbEntityStatic and is missing a schema.`
      );
    }

    const existing = await pool.query<Required<T>>(
      `SELECT * FROM ${constructor.tableName} WHERE id = '${record.id}'`
    );

    if (existing.rows.length === 0) {
      throw Error(
        `No record found in table ${constructor.tableName} with id: '${record.id}'`
      );
    }

    const oldValue = new (record.constructor as IDbEntityStatic<T>)(
      existing.rows[0]
    ).toModel();

    const errorMessage = record.isValidUpdate(oldValue);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    const columnValues: string[] = [];

    (Object.keys(constructor.schema) as DbEntitySchema<T>[])
      .filter(
        (k) =>
          constructor.immutableColumns.indexOf(k as DbEntitySchema<T>) === -1
      )
      .forEach((k) => {
        const value = dbSerializeField(k, record);

        if (value !== undefined) {
          columnValues.push(`${String(k)} = ${value}`);
        }
      });

    columnValues.push(`updateDate = ${dbSerializeDate(new Date())}`);

    const result = await pool.query<Required<T>>(
      `UPDATE ${constructor.tableName} SET ${columnValues.join(
        ','
      )} WHERE id = '${record.id}'`
    );

    if (result.rows.length !== 1) {
      throw Error();
    }

    return new (record.constructor as IDbEntityStatic<T>)(
      result.rows[0]
    ).toModel();
  },
  async hardDelete<T extends Partial<IBaseEntity>>(record: DbEntity<T>) {
    const constructor = record.constructor as unknown as IDbEntityStatic<T>;

    if (typeof constructor.tableName !== 'string' || !constructor.tableName) {
      throw Error(
        `${record.constructor.name} is not of type IDbEntityStatic and is missing a tableName.`
      );
    }

    await pool.query(
      `DELETE FROM ${constructor.tableName} WHERE id = '${record.id}'`
    );

    return;
  },
  async query(tableName: TableName) {

  },
  async migrate(entities: IDbEntityStatic<IBaseEntity>[]) {
    for (let i = 0; i < entities.length; ++i) {
      const entity = entities[i];
      const columns = generateTableColumnDefinitions(entity.schema);

      await pool.query(
        `CREATE TABLE IF NOT EXISTS ${entity.tableName} (${columns.join(
          ',\n'
        )})`
      );
    }

    return;
  }
};
