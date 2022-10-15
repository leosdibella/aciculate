import { FieldType, EntityName } from '@enums';
import { IBaseModel, IForeignKey } from '@interfaces';
import { sanitizeDate } from '@shared/utilities';
import { IApiError } from '@shared/interfaces';
import { Field, EntitySchema, ModelEntityName } from '@types';
import { ApiError } from '@shared/classes';
import { ApiErrorCode } from '@shared/enums';
import { field, foreignKey, primaryKey, userImmutable } from '@decorators';
import { databaseMetadataKeys } from '@data/database-metadata-keys';

export abstract class BaseEntity<T extends IBaseModel> {
  protected readonly _createdDate?: Date;
  protected readonly _updatedDate?: Date;

  #schema?: Readonly<EntitySchema<T>>;
  #name?: ModelEntityName<T>;
  #userImmutableFields?: Readonly<Extract<keyof T, string>[]>;
  #primaryKey?: Extract<keyof T, string>;
  #foreignKeys?: Readonly<
    Partial<Record<Extract<keyof T, string>, Readonly<IForeignKey>>>
  >;

  //defaultValue: 'uuid_generate_v4()'
  @field({
    type: FieldType.uuid
  })
  @primaryKey
  @userImmutable
  public readonly id?: string;

  @field({
    type: FieldType.boolean
  })
  public readonly deleted?: boolean;

  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.user
  })
  @userImmutable
  public readonly createdBy?: string;

  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.user
  })
  @userImmutable
  public readonly updatedBy?: string;

  //defaultValue: 'now()'
  @field({
    type: FieldType.timestamptz
  })
  public get createdDate() {
    return this._createdDate ? new Date(this._createdDate) : undefined;
  }

  @field({
    type: FieldType.timestamptz
  })
  public get updatedDate() {
    return this._updatedDate ? new Date(this._updatedDate) : undefined;
  }

  public get userImmutableFields(): Readonly<Extract<keyof T, string>[]> {
    if (!this.#userImmutableFields) {
      this.#userImmutableFields = Object.freeze<Extract<keyof T, string>>(
        Reflect.getMetadata(
          databaseMetadataKeys.userImmutable,
          this.constructor.prototype
        ) ?? []
      );
    }

    return this.#userImmutableFields!;
  }

  public get primaryKey(): Extract<keyof T, string> {
    if (!this.#primaryKey) {
      this.#primaryKey =
        Reflect.getMetadata(
          databaseMetadataKeys.primaryKey,
          this.constructor.prototype
        ) ?? 'id';
    }

    return this.#primaryKey!;
  }

  public get foreignKeys(): Partial<
    Record<Extract<keyof T, string>, Readonly<IForeignKey>>
  > {
    if (!this.#foreignKeys) {
      this.#foreignKeys = Object.freeze<
        Partial<Record<Extract<keyof T, string>, Readonly<IForeignKey>>>
      >(
        (Reflect.getMetadata(
          databaseMetadataKeys.forgienKey,
          this.constructor.prototype
        ) ?? {}) as Partial<
          Record<Extract<keyof T, string>, Readonly<IForeignKey>>
        >
      );
    }

    return this.#foreignKeys!;
  }

  public get schema(): EntitySchema<T> {
    if (!this.#schema) {
      this.#schema = Object.freeze<EntitySchema<T>>(
        (Reflect.getMetadata(
          databaseMetadataKeys.field,
          this.constructor.prototype
        ) ?? {}) as EntitySchema<T>
      );
    }

    return this.#schema!;
  }

  public get name(): ModelEntityName<T> {
    if (!this.#name) {
      this.#name = Reflect.getMetadata(
        databaseMetadataKeys.entity,
        this.constructor
      );
    }

    return this.#name!;
  }

  public toModel(): T {
    const schema = this.schema;
    const entityName = this.name;
    const errors: IApiError[] = [];
    const model: Partial<T> = {};

    (Object.keys(schema) as Extract<keyof this & keyof T, string>[]).forEach(
      (k) => {
        const entityField = schema[k];

        if (
          typeof field === 'object' &&
          !Array.isArray(field) &&
          (entityField as Field).isSecured
        ) {
          return;
        }

        if (this[k] === undefined) {
          errors.push({
            errorCode: ApiErrorCode.databseSchemaValidationError,
            message: `${entityName} is missing value for property ${k}.`
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
    const schema = this.schema;
    const entityName = this.name;
    const apiErrors: IApiError[] = [];
    let json: Record<string, unknown> = {};

    try {
      json = JSON.parse(serialized);

      if (typeof json !== 'object' || !json || Array.isArray(json)) {
        apiErrors.push({
          errorCode: ApiErrorCode.databseSchemaValidationError,
          message: `${entityName} must be an object, recevied ${typeof json}.`
        });
      }
    } catch {
      apiErrors.push({
        errorCode: ApiErrorCode.databseSchemaValidationError,
        message: `${entityName} must be an object, unable to parse json received.`
      });
    }

    if (apiErrors.length) {
      throw new ApiError(apiErrors);
    }

    const model = {} as Partial<T>;

    (Object.keys(schema) as Extract<keyof T, string>[])
      .filter((k) => typeof schema[k] !== 'string' && !Array.isArray(schema[k]))
      .forEach((cn) => {
        const entityField = schema[cn] as Field;
        const value = json[cn];

        if (entityField.isSecured) {
          return;
        }

        if (entityField.type === FieldType.smallint) {
          if (
            (typeof value === 'number' && (value | 0) === value) ||
            (entityField.isNullable && value === null)
          ) {
            model[cn] = value as T[Extract<keyof T, string>];
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${entityName} expects ${cn} to be a ${entityField.type}, received: ${value}.`
            });
          }
        }

        if (entityField.type === FieldType.boolean) {
          if (
            typeof value === 'boolean' ||
            (entityField.isNullable && value === null)
          ) {
            model[cn] = value as T[Extract<keyof T, string>];
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${entityName} expects ${cn} to be a ${entityField.type}, received: ${value}.`
            });
          }
        }

        if (
          entityField.type === FieldType.uuid ||
          entityField.type === FieldType.varchar
        ) {
          if (
            typeof value === 'string' ||
            (entityField.isNullable && value === null)
          ) {
            model[cn] = value as unknown as T[Extract<keyof T, string>];
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${entityName} expects ${cn} to be a ${entityField.type}, received: ${value}.`
            });
          }
        }

        if (
          entityField.type === FieldType.timestamptz ||
          entityField.type === FieldType.date
        ) {
          if (
            typeof value === 'string' ||
            (entityField.isNullable && value === null)
          ) {
            const date = value === null ? null : new Date(value as string);

            model[cn] = date as unknown as T[Extract<keyof T, string>];

            if (value !== null && isNaN(date!.getTime())) {
              apiErrors.push({
                errorCode: ApiErrorCode.databseSchemaValidationError,
                message: `${entityName} expects ${cn} to be a serialized date string, received: ${value}.`
              });
            }
          } else if (value !== undefined) {
            apiErrors.push({
              errorCode: ApiErrorCode.databseSchemaValidationError,
              message: `${entityName} expects ${cn} to be a serialized date string, received: ${value}.`
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
