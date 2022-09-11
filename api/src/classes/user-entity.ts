import { DbTableName } from '@shared/enums';
import { DbColumnType } from 'src/enums';
import { DbEntity } from 'src/types';
import { IUserModel } from '../interfaces';
import { BaseEntity } from './base-entity';

export class UserEntity extends BaseEntity implements DbEntity<IUserModel> {
  public readonly tableName = DbTableName.calendar;

  public readonly immutableColumns: Readonly<
    Extract<keyof IUserModel, string>[]
  > = BaseEntity._immutableColumns;

  public firstName?: string;
  public lastName?: string;
  public email?: string;
  public passwordHash?: string;
  public passwordSalt?: string;

  public readonly schema = {
    ...BaseEntity.schema,
    firstName: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 512
    }),
    lastName: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 512
    }),
    email: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 1024
    }),
    passwordHash: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 1024
    }),
    passwordSalt: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 1024
    }),
    organizations: null,
    calendars: null
  };

  public fromJson(json: Record<string, unknown>): Partial<IUserModel> {
    const model = BaseEntity.fromJson<IUserModel>(json, this.tableName);

    return model;
  }

  public validateInsert() {
    BaseEntity.validateInsert<IUserModel>(this);
  }

  public validateUpdate(model: IUserModel) {
    BaseEntity.validateUpdate<IUserModel>(this, model);
  }

  public toModel(): IUserModel {
    return BaseEntity.toModel<IUserModel>(this);
  }

  public toJson(): string {
    return BaseEntity.toJson<IUserModel>(this);
  }

  public constructor(model: Partial<IUserModel>) {
    super(model);

    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = model.email;
    this.passwordHash = model.passwordHash;
    this.passwordSalt = model.passwordSalt;
  }
}
