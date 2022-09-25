import { DbTableName, DbColumnType } from '../enums';
import { DbEntity } from '../types';
import { validateColumnValues } from '../utilities';
import { IUserModel } from '../interfaces';
import { BaseEntity } from './base-entity';

export class UserEntity
  extends BaseEntity<IUserModel>
  implements DbEntity<IUserModel>
{
  public static readonly schema = {
    ...BaseEntity._schema,
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
      maxLength: 512
    }),
    passwordHash: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 1024,
      isSecured: true
    }),
    passwordSalt: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 1024,
      isSecured: true
    }),
    organizations: Object.freeze([]),
    calendars: Object.freeze([])
  };

  public readonly tableName = DbTableName.user;
  public readonly schema = UserEntity.schema;

  public readonly userImmutableColumns: Readonly<
    Extract<keyof IUserModel, string>[]
  > = Object.freeze([
    ...BaseEntity.userImmutableColumns,
    'passwordHash',
    'passwordSalt'
  ]);

  public firstName?: string;
  public lastName?: string;
  public email?: string;
  public passwordHash?: string;
  public passwordSalt?: string;

  public validateInsert() {
    validateColumnValues(this);
  }

  public validateUpdate(model: IUserModel) {
    validateColumnValues(this, model);
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
