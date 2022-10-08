import { DbTableName, DbColumnType } from '@enums';
import { DbEntity } from '@types';
import { generateHash, generateSalt, validateColumnValues } from '@utilities';
import { IDbSeedData, IUserModel } from '@interfaces';
import { BaseEntity } from './base-entity';
import { entity } from '@decorators';

@entity()
export class UserEntity
  extends BaseEntity<IUserModel>
  implements DbEntity<IUserModel>
{
  public static readonly tableName = DbTableName.user;

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

  public static async seedAsync(): Promise<IDbSeedData<IUserModel>> {
    const salt = generateSalt();

    return {
      values: [
        {
          firstName: process.env.ACIULCATE_SYSTEM_USER_FIRSTNAME,
          lastName: process.env.ACIULCATE_SYSTEM_USER_LASTNAME,
          email: process.env.ACIULCATE_SYSTEM_USER_EMAIL,
          passwordHash: await generateHash(
            process.env.ACIULCATE_SYSTEM_USER_PASSWORD || '',
            salt
          ),
          passwordSalt: salt
        }
      ],
      conditions: ['email']
    };
  }

  public readonly tableName = UserEntity.tableName;
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
