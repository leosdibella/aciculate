import { IDbEntityStatic, IBaseModel } from '../interfaces';
import { DbColumn, DbEntity, DbEntitySchema, StringColumn } from '../types';
import { DbColumnType } from '../enums';
import { isPositiveInteger } from '@shared/utilities';
import { IApiError } from '@shared/interfaces';
import { ApiErrorCode, DbTableName } from '@shared/enums';
import { ApiError } from '@shared/classes';

function getSchemaValidationError<T extends IBaseModel>(
  tableName: DbTableName,
  columnName: DbEntitySchema<T>,
  fieldValue: string | undefined | null,
  remainingText: string,
  errorCode:
    | ApiErrorCode.databseSchemaValidationError
    | ApiErrorCode.databaseOptimisticConcurencyError = ApiErrorCode.databseSchemaValidationError,
  id?: string
) {
  const idString = id ? ` with id: '${id}' ` : ' ';

  return {
    errorCode,
    message: `Record of type ${tableName}${idString}has invalid value for field - ${columnName}: '${fieldValue}', ${remainingText}.`
  };
}

function getSchemaConfigurationError<T extends IBaseModel>(
  tableName: DbTableName,
  columnName: DbEntitySchema<T>,
  column: DbColumn,
  remainingText: string
) {
  return {
    errorCode: ApiErrorCode.datbaseSchemaConfigurationError,
    message: `Schema Configuration Error - Table: ${tableName} with column: ${columnName} of type: ${column.type}, ${remainingText}.`
  };
}

function validateStringColumnValue<T extends IBaseModel>(
  tableName: DbTableName,
  columnName: DbEntitySchema<T>,
  column: StringColumn,
  fieldValue: string | undefined | null,
  id?: string
) {
  const errors: IApiError[] = [];

  if (
    (!column.isNullable && (fieldValue === undefined || fieldValue === null)) ||
    (column.minLength !== undefined &&
      fieldValue !== undefined &&
      fieldValue !== null &&
      fieldValue.length < column.minLength)
  ) {
    errors.push(
      getSchemaValidationError(
        tableName,
        columnName,
        fieldValue,
        `this field must contain at least ${column.minLength ?? 0} characters`,
        ApiErrorCode.databseSchemaValidationError,
        id
      )
    );
  }

  if (
    column.maxLength < Infinity &&
    fieldValue !== undefined &&
    fieldValue !== null &&
    fieldValue.length > column.maxLength
  ) {
    errors.push(
      getSchemaValidationError(
        tableName,
        columnName,
        fieldValue,
        `this field cannot exceed ${column.maxLength} characters`,
        ApiErrorCode.databseSchemaValidationError,
        id
      )
    );
  }

  return errors;
}

export function validateColumnValues<T extends IBaseModel>(
  newValue: DbEntity<Partial<T>>,
  oldValue?: Required<T>
) {
  const errors: IApiError[] = [];
  const EntityConstructor = newValue.constructor as IDbEntityStatic<T>;

  if (newValue.id !== undefined) {
    errors.push(
      getSchemaValidationError(
        EntityConstructor.tableName,
        'id',
        newValue.id,
        'ids are auto-generated at the database level'
      )
    );

    if (oldValue && newValue.id !== oldValue.id) {
      errors.push(
        getSchemaValidationError(
          EntityConstructor.tableName,
          'id',
          newValue.id,
          'ids are immutable',
          ApiErrorCode.databseSchemaValidationError,
          oldValue.id
        )
      );
    }
  }

  if (newValue.createdDate !== undefined) {
    errors.push(
      getSchemaValidationError(
        EntityConstructor.tableName,
        'createdDate',
        newValue.createdDate.toISOString(),
        `createdDate is auto-generated at the database level`,
        ApiErrorCode.databseSchemaValidationError,
        newValue.id
      )
    );

    if (
      oldValue &&
      newValue.createdDate.getTime() !== oldValue.createdDate.getTime()
    ) {
      getSchemaValidationError(
        EntityConstructor.tableName,
        'createdDate',
        newValue.createdDate.toISOString(),
        `mismatched createdDate values, createdDate is immutable, createdDate for existing record: '${oldValue.createdDate.toISOString()}'`,
        ApiErrorCode.databseSchemaValidationError,
        oldValue.id
      );
    }
  }

  if (newValue.updatedDate !== undefined) {
    errors.push(
      getSchemaValidationError(
        EntityConstructor.tableName,
        'updatedDate',
        newValue.updatedDate.toISOString(),
        `updatedDate is auto-generated at the database level`,
        ApiErrorCode.databseSchemaValidationError,
        newValue.id
      )
    );

    if (
      oldValue &&
      newValue.updatedDate.getTime() !== oldValue.updatedDate.getTime()
    ) {
      errors.push(
        getSchemaValidationError(
          EntityConstructor.tableName,
          'updatedDate',
          newValue.updatedDate.toISOString(),
          `updatedDate has mismatched timestamps, this record has been modified since last accessed, please confirm your changes and retry`,
          ApiErrorCode.databaseOptimisticConcurencyError,
          newValue.id
        )
      );
    }
  }

  (Object.keys(EntityConstructor.schema) as DbEntitySchema<T>[])
    .filter(
      (k) =>
        EntityConstructor.immutableColumns.indexOf(k as DbEntitySchema<T>) ===
        -1
    )
    .forEach((columnName) => {
      let columnErrors: IApiError[] | undefined;
      const column = EntityConstructor.schema[columnName];
      const columnValue = newValue[columnName];

      if (column.type === DbColumnType.varchar) {
        columnErrors = validateStringColumnValue(
          EntityConstructor.tableName,
          columnName,
          column,
          columnValue as string | null | undefined,
          oldValue?.id
        );
      } else if (
        !column.isNullable &&
        (columnValue === null || columnValue === undefined)
      ) {
        errors.push(
          getSchemaValidationError(
            EntityConstructor.tableName,
            columnName,
            null,
            `the column ${columnName} does not allow null values`,
            ApiErrorCode.databseSchemaValidationError,
            newValue.id
          )
        );
      }

      if (columnErrors?.length) {
        for (let i = 0; i < columnErrors.length; ++i) {
          errors.push(columnErrors[i]);
        }
      }
    });

  if (errors.length) {
    throw new ApiError(errors);
  }
}

function validateColumnConfiguration<T extends IBaseModel>(
  tableName: DbTableName,
  columnName: DbEntitySchema<T>,
  column: DbColumn
) {
  const errors: IApiError[] = [];
  let typeModifierText = '';

  if (column.type === DbColumnType.varchar) {
    if (!isPositiveInteger(column.maxLength) || column.maxLength !== Infinity) {
      errors.push(
        getSchemaConfigurationError(
          tableName,
          columnName,
          column,
          `maxLength: ${column.maxLength} is invalid, must be a postivie integer or ${Infinity}`
        )
      );
    }

    if (
      column.minLength !== undefined &&
      (!isPositiveInteger(column.minLength) ||
        column.minLength > column.maxLength ||
        column.minLength === Infinity)
    ) {
      errors.push(
        getSchemaConfigurationError(
          tableName,
          columnName,
          column,
          `minLength: ${column.minLength} is invalid, must be a finite positive integer with value strictly less than the maxLength: ${column.maxLength}`
        )
      );
    }

    typeModifierText = `(${
      isFinite(column.maxLength) ? column.maxLength : 'max'
    })`;
  }

  return {
    typeModifierText,
    errors
  };
}

export function generateTableColumnDefinitions<T extends IBaseModel>(
  tableName: DbTableName,
  schema: Record<DbEntitySchema<T>, DbColumn>
): string[] {
  const columns: string[] = [];
  const apiErrors: IApiError[] = [];

  (Object.keys(schema) as DbEntitySchema<T>[]).forEach((columnName) => {
    const column = schema[columnName];

    const { typeModifierText, errors } = validateColumnConfiguration(
      tableName,
      columnName,
      column
    );

    errors.forEach((e) => apiErrors.push(e));

    const typeText = `${column.type}${typeModifierText}`;
    const primaryKeyText = column.isPrimaryKey ? ' PRIMARY KEY ' : '';

    const nullableText =
      column.isNullable || primaryKeyText ? '' : ' NOT NULL ';

    const defaultText =
      column.defaultValue !== undefined
        ? ` DEFAULT ${column.defaultValue} `
        : '';

    const forgienKeyText = column.foreignKeyTable
      ? ` REFERENCES ${column.foreignKeyTable}(${column.foreignKeyColumn}) `
      : '';

    const casecadeText = column.cascadeOnDelete ? ' ON DELETE CASCADE ' : '';

    columns.push(
      `${columnName} ${typeText}${primaryKeyText}${nullableText}${defaultText}${forgienKeyText}${casecadeText};`
    );
  });

  if (apiErrors.length) {
    throw new ApiError(apiErrors);
  }

  return columns;
}

export function getColumnNamesAndValues<T extends Partial<IBaseModel>>(
  record: DbEntity<T>
) {
  const EntityConstructor = record.constructor as IDbEntityStatic<T>;
  const columnNames: DbEntitySchema<T>[] = [];
  const columnValues: unknown[] = [];

  (Object.keys(EntityConstructor.schema) as DbEntitySchema<T>[])
    .filter(
      (columnName) =>
        EntityConstructor.immutableColumns.indexOf(columnName) === -1
    )
    .forEach((columnName) => {
      const value = record[columnName];

      if (value !== undefined) {
        columnNames.push(columnName);
        columnValues.push(value);
      }
    });

  return {
    columnNames,
    columnValues
  };
}
