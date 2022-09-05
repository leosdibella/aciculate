import { DbEntitySchema } from '../types';
import { ApiErrorCode } from '@shared/enums';
import { DbColumnType } from '../enums';
import { IBaseEntity } from '../interfaces';
import { sanitizeDate } from '@shared/utilities';
import { IApiError } from '@shared/interfaces';

export abstract class BaseEntity implements Partial<IBaseEntity> {
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

  public static immutableColumns: DbEntitySchema<IBaseEntity>[] = [
    'id',
    'updatedDate',
    'createdDate'
  ];

  protected _id?: string;
  protected _createdDate?: Date;
  protected _updatedDate?: Date;

  public static isValidInsert<T extends Partial<BaseEntity>>(
    newValue: T
  ): IApiError[] {
    const errors: IApiError[] = [];

    if (newValue.id) {
      errors.push({
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Attempted to insert record of type: ${newValue.constructor.name} with id: ${newValue}, ids are auto generated at the database level.`
      });
    }

    if (newValue.createdDate) {
      errors.push({
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Attempted to insert record of type: ${newValue.constructor.name}, createdDate is auto generated at the database level.`
      });
    }

    if (newValue.updatedDate) {
      errors.push({
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Attempted to insert record of type: ${newValue.constructor.name}, updateDate is auto generated at the database level.`
      });
    }

    return errors;
  }

  public static isValidUpdate<T extends IBaseEntity>(
    oldValue: T,
    newValue: Partial<T>
  ): IApiError[] {
    return oldValue.updatedDate !== newValue.updatedDate
      ? [
          {
            errorCode: ApiErrorCode.optimisticConcurencyFailure,
            message: `Record of type: ${oldValue.constructor.name}, with id: '${oldValue.id}' has mismatched timestamps`
          }
        ]
      : [];
  }

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

  public toModel(): Required<IBaseEntity> | IApiError[] {
    const errors: IApiError[] = [];

    if (this.id === undefined) {
      errors.push();
    }

    if (this.createdDate === undefined) {
      errors.push();
    }

    if (this.updatedDate === undefined) {
      errors.push();
    }

    if (this.deleted === undefined) {
      errors.push();
    }

    if (errors.length) {
      return errors;
    }

    return {
      id: this.id!,
      deleted: this.deleted!,
      updatedDate: this.updatedDate!,
      createdDate: this.createdDate!
    };
  }

  public constructor(baseEntity: Partial<IBaseEntity>) {
    this._id = baseEntity.id;
    this._createdDate = sanitizeDate(baseEntity.createdDate);
    this.deleted = baseEntity.deleted;
    this._updatedDate = sanitizeDate(baseEntity.updatedDate);
  }
}
