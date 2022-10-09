import { DbColumnType, DbTableName } from '@enums';
import { IBaseModel } from '@interfaces';
import { sanitizeDate } from '@shared/utilities';
import { IApiError } from '@shared/interfaces';
import { DbColumn, DbEntity, DbSchema } from '@types';
import { ApiError } from '@shared/classes';
import { ApiErrorCode } from '@shared/enums';
import { field, foreignKey, primaryKey, userImmutable } from '@decorators';
import { databaseMetadataKeys } from '@data/database-metadata-keys';

export abstract class BaseEntity<T extends IBaseModel>
  implements DbEntity<IBaseModel>
{
  protected get _schema(): DbSchema<T> {
    return Reflect.getMetadata(
      databaseMetadataKeys.field,
      this.constructor.prototype
    );
  }

  protected get _tableName(): string {
    return Reflect.getMetadata(
      databaseMetadataKeys.entity,
      this.constructor.prototype
    );
  }

  protected readonly _createdDate?: Date;
  protected readonly _updatedDate?: Date;

  @field({
    type: DbColumnType.uuid,
    defaultValue: 'uuid_generate_v4()'
  })
  @(primaryKey<IBaseModel>)
  @(userImmutable<IBaseModel>)
  public readonly id?: string;

  @field({
    type: DbColumnType.boolean
  })
  public readonly deleted?: boolean;

  @field({
    type: DbColumnType.uuid
  })
  @foreignKey({
    foreignKeyTable: DbTableName.user,
    foreignKeyColumn: 'id'
  })
  @(userImmutable<IBaseModel>)
  public readonly createdBy?: string;

  @field({
    type: DbColumnType.uuid
  })
  @foreignKey({
    foreignKeyTable: DbTableName.user,
    foreignKeyColumn: 'id'
  })
  @(userImmutable<IBaseModel>)
  public readonly updatedBy?: string;

  @field({
    type: DbColumnType.timestamptz,
    defaultValue: 'now()'
  })
  public get createdDate() {
    return this._createdDate ? new Date(this._createdDate) : undefined;
  }

  @field({
    type: DbColumnType.timestamptz,
    defaultValue: 'now()'
  })
  public get updatedDate() {
    return this._updatedDate ? new Date(this._updatedDate) : undefined;
  }

  public toModel(): T {
    const schema = this._schema;
    const tableName = this._tableName;
    const errors: IApiError[] = [];
    const model: Partial<T> = {};

    (Object.keys(schema) as Extract<keyof this & keyof T, string>[]).forEach(
      (k) => {
        const column = schema[k];

        if (
          typeof column === 'object' &&
          !Array.isArray(column) &&
          (column as DbColumn).isSecured
        ) {
          return;
        }

        if (this[k] === undefined) {
          errors.push({
            errorCode: ApiErrorCode.databseSchemaValidationError,
            message: `${tableName} is missing value for property ${k}.`
          });
        } else {
          model[k] = this[k] as unknown as T[Extract<
            keyof this & keyof T,
            string
          >];
        }
      }
    );

    if (errors.length) {
      throw new ApiError(errors);
    }

    return model as T;
  }

  public toJson(): string {
    return JSON.stringify(this.toModel());
  }

  public fromJson(serialized: string): Partial<T> {
    const schema = this._schema;
    const tableName = this._tableName;
    const apiErrors: IApiError[] = [];
    let json: Record<string, unknown> = {};

    try {
      json = JSON.parse(serialized);

      if (typeof json !== 'object' || !json || Array.isArray(json)) {
        apiErrors.push({
          errorCode: ApiErrorCode.databseSchemaValidationError,
          message: `${tableName} must be an object, recevied ${typeof json}.`
        });
      }
    } catch {
      apiErrors.push({
        errorCode: ApiErrorCode.databseSchemaValidationError,
        message: `${tableName} must be an object, unable to parse json received.`
      });
    }

    if (apiErrors.length) {
      throw new ApiError(apiErrors);
    }

    const model = {} as Partial<T>;

    (Object.keys(schema) as Extract<keyof T, string>[])
      .filter((k) => typeof schema[k] !== 'string' && !Array.isArray(schema[k]))
      .forEach((cn) => {
        const column = schema[cn] as DbColumn;
        const value = json[cn];

        if (column.isSecured) {
          return;
        }

        if (column.type === DbColumnType.smallint) {
          if (
            (typeof value === 'number' && (value | 0) === value) ||
            (column.isNullable && value === null)
          ) {
            model[cn] = value as T[Extract<keyof T, string>];
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${tableName} expects ${cn} to be a ${column.type}, received: ${value}.`
            });
          }
        }

        if (column.type === DbColumnType.boolean) {
          if (
            typeof value === 'boolean' ||
            (column.isNullable && value === null)
          ) {
            model[cn] = value as T[Extract<keyof T, string>];
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${tableName} expects ${cn} to be a ${column.type}, received: ${value}.`
            });
          }
        }

        if (
          column.type === DbColumnType.uuid ||
          column.type === DbColumnType.varchar
        ) {
          if (
            typeof value === 'string' ||
            (column.isNullable && value === null)
          ) {
            model[cn] = value as unknown as T[Extract<keyof T, string>];
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${tableName} expects ${cn} to be a ${column.type}, received: ${value}.`
            });
          }
        }

        if (
          column.type === DbColumnType.timestamptz ||
          column.type === DbColumnType.date
        ) {
          if (
            typeof value === 'string' ||
            (column.isNullable && value === null)
          ) {
            const date = value === null ? null : new Date(value as string);

            model[cn] = date as unknown as T[Extract<keyof T, string>];

            if (value !== null && isNaN(date!.getTime())) {
              apiErrors.push({
                errorCode: ApiErrorCode.databseSchemaValidationError,
                message: `${tableName} expects ${cn} to be a serialized date string, received: ${value}.`
              });
            }
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${tableName} expects ${cn} to be a serialized date string, received: ${value}.`
            });
          }
        }
      });

    if (apiErrors.length) {
      throw new ApiError(apiErrors);
    }

    return model;
  }

  public constructor(model: Partial<IBaseModel>) {
    this.id = model.id;
    this.deleted = model.deleted;
    this._createdDate = sanitizeDate(model.createdDate);
    this._updatedDate = sanitizeDate(model.updatedDate);
    this.createdBy = model.createdBy;
    this.updatedBy = model.updatedBy;
  }
}
