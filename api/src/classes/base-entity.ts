import { DbEntity } from '../types';
import { DbColumnType } from '../enums';
import { IBaseModel } from '../interfaces';
import { sanitizeDate } from '@shared/utilities';
import { IApiError } from '@shared/interfaces';
import { validateColumnValues } from '../utilities';
import { ApiError } from '@shared/classes';
import { DbTableName } from '@shared/enums';

export abstract class BaseEntity implements Partial<IBaseModel> {
  public static schema = {
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
    })
  };

  protected static _immutableColumns: Readonly<
    Extract<keyof IBaseModel, string>[]
  > = Object.freeze(['id', 'updatedDate', 'createdDate']);

  public static validateInsert<T extends IBaseModel>(entity: DbEntity<T>) {
    validateColumnValues(entity);
  }

  public static validateUpdate<T extends IBaseModel>(
    entity: DbEntity<T>,
    model: T
  ) {
    validateColumnValues(entity, model);
  }

  public static toModel<T extends IBaseModel>(entity: DbEntity<T>): T {
    const errors: IApiError[] = [];
    const model: Partial<T> = {};

    (Object.keys(entity.schema) as Extract<keyof T, string>[]).forEach((k) => {
      if (entity[k] === undefined) {
        errors.push();
      } else {
        model[k] = entity[k] as unknown as T[Extract<keyof T, string>];
      }
    });

    if (errors.length) {
      throw new ApiError(errors);
    }

    return model as T;
  }

  public static toJson<T extends IBaseModel>(entity: DbEntity<T>): string {
    return JSON.stringify(entity.toModel());
  }

  public static fromJson<T extends IBaseModel>(
    json: Record<string, unknown>,
    tableName: DbTableName
  ): Partial<T> {
    const model = {} as Partial<T>;

    if (typeof json !== 'object' || !json) {
      // TODO
      throw Error(
        `Unable to convert JSON data into ${tableName}, JSON not of type object.`
      );
    }

    if (typeof json.id === 'string') {
      model.id = json.id;
    }

    return model;
  }

  protected readonly _id?: string;
  protected readonly _createdDate?: Date;
  protected readonly _updatedDate?: Date;

  public deleted?: boolean;

  public get id() {
    return this._id;
  }

  public get createdDate() {
    return this._createdDate;
  }

  public get updatedDate() {
    return this._updatedDate;
  }

  public constructor(model: Partial<IBaseModel>) {
    this._id = model.id;
    this._createdDate = sanitizeDate(model.createdDate);
    this.deleted = model.deleted;
    this._updatedDate = sanitizeDate(model.updatedDate);
  }
}
