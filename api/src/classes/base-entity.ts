import { DbEntity, DbEntitySchema } from '../types';
import { DbColumnType } from '../enums';
import { IBaseModel, IDbEntityStatic } from '../interfaces';
import { sanitizeDate } from '@shared/utilities';
import { IApiError } from '@shared/interfaces';
import { validateColumnValues } from '../utilities';
import { ApiError } from '@shared/classes';

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
    DbEntitySchema<Partial<IBaseModel>>[]
  > = Object.freeze(['id', 'updatedDate', 'createdDate']);

  public static validateInsert<T extends IBaseModel>(
    newValue: DbEntity<Partial<T>>
  ) {
    validateColumnValues(newValue);
  }

  public static validateUpdate<T extends IBaseModel>(
    newValue: DbEntity<Partial<T>>,
    oldValue: Required<T>
  ) {
    validateColumnValues(newValue, oldValue);
  }

  public static toModel<T extends IBaseModel>(
    record: DbEntity<Partial<T>>
  ): Required<T> {
    const errors: IApiError[] = [];
    const schema = (record.constructor as IDbEntityStatic<T>).schema;
    const model: Partial<T> = {};

    (Object.keys(schema) as DbEntitySchema<T>[]).forEach((k) => {
      if (record[k] === undefined) {
        errors.push();
      } else {
        model[k] = record[k];
      }
    });

    if (errors.length) {
      throw new ApiError(errors);
    }

    return model as Required<T>;
  }

  public static toJson<T extends IBaseModel>(
    record: DbEntity<Partial<T>>
  ): string {
    return JSON.stringify(record.toModel());
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
