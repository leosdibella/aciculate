import { DbColumnType, DbTableName } from '@enums';
import { IBaseModel } from '@interfaces';
import { sanitizeDate } from '@shared/utilities';
import { IApiError } from '@shared/interfaces';
import { DbColumn, DbSchema } from '@types';
import { ApiError } from '@shared/classes';
import { ApiErrorCode } from '@shared/enums';

export abstract class BaseEntity<T extends IBaseModel>
  implements Partial<IBaseModel>
{
  protected static readonly _schema = Object.freeze({
    id: Object.freeze({
      isPrimaryKey: true,
      type: DbColumnType.uuid,
      defaultValue: 'uuid_generate_v4()'
    }),
    deleted: Object.freeze({
      type: DbColumnType.boolean,
      defaultValue: false
    }),
    updatedDate: Object.freeze({
      type: DbColumnType.timestamptz,
      defaultValue: 'now()'
    }),
    createdDate: Object.freeze({
      type: DbColumnType.timestamptz,
      defaultValue: 'now()'
    }),
    updatedBy: Object.freeze({
      isNullable: true,
      type: DbColumnType.uuid,
      foreignKeyTable: DbTableName.user,
      foreignKeyColumn: 'id'
    }),
    createdBy: Object.freeze({
      isNullable: true,
      type: DbColumnType.uuid,
      foreignKeyTable: DbTableName.user,
      foreignKeyColumn: 'id'
    })
  });

  public static userImmutableColumns: Readonly<
    Extract<keyof IBaseModel, string>[]
  > = Object.freeze([
    'id',
    'updatedDate',
    'createdDate',
    'createdBy',
    'updatedBy'
  ]);

  protected readonly _createdDate?: Date;
  protected readonly _updatedDate?: Date;
  public abstract readonly schema: DbSchema<T>;
  public abstract readonly tableName: string;

  public readonly id?: string;
  public readonly deleted?: boolean;
  public readonly createdBy?: string;
  public readonly updatedBy?: string;

  public get createdDate() {
    return this._createdDate ? new Date(this._createdDate) : undefined;
  }

  public get updatedDate() {
    return this._updatedDate ? new Date(this._updatedDate) : undefined;
  }

  public toModel(): T {
    const errors: IApiError[] = [];
    const model: Partial<T> = {};

    (
      Object.keys(this.schema) as Extract<keyof this & keyof T, string>[]
    ).forEach((k) => {
      const column = this.schema[k];

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
          message: `${this.tableName} is missing value for property ${k}.`
        });
      } else {
        model[k] = this[k] as unknown as T[Extract<
          keyof this & keyof T,
          string
        >];
      }
    });

    if (errors.length) {
      throw new ApiError(errors);
    }

    return model as T;
  }

  public toJson(): string {
    return JSON.stringify(this.toModel());
  }

  public fromJson(serialized: string): Partial<T> {
    const apiErrors: IApiError[] = [];
    let json: Record<string, unknown> = {};

    try {
      json = JSON.parse(serialized);

      if (typeof json !== 'object' || !json || Array.isArray(json)) {
        apiErrors.push({
          errorCode: ApiErrorCode.databseSchemaValidationError,
          message: `${
            this.tableName
          } must be an object, recevied ${typeof json}.`
        });
      }
    } catch {
      apiErrors.push({
        errorCode: ApiErrorCode.databseSchemaValidationError,
        message: `${this.tableName} must be an object, unable to parse json received.`
      });
    }

    if (apiErrors.length) {
      throw new ApiError(apiErrors);
    }

    const model = {} as Partial<T>;

    (Object.keys(this.schema) as Extract<keyof T, string>[])
      .filter(
        (k) =>
          typeof this.schema[k] !== 'string' && !Array.isArray(this.schema[k])
      )
      .forEach((cn) => {
        const column = this.schema[cn] as DbColumn;
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
              message: `${this.tableName} expects ${cn} to be a ${column.type}, received: ${value}.`
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
              message: `${this.tableName} expects ${cn} to be a ${column.type}, received: ${value}.`
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
              message: `${this.tableName} expects ${cn} to be a ${column.type}, received: ${value}.`
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
                message: `${this.tableName} expects ${cn} to be a serialized date string, received: ${value}.`
              });
            }
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${this.tableName} expects ${cn} to be a serialized date string, received: ${value}.`
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
