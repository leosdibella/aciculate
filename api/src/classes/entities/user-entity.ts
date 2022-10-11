import { DbColumnType } from '@enums';
import { DbEntity } from '@types';
import { generateHash, generateSalt } from '@utilities';
import {
  ICalendarModel,
  IDbSeedData,
  IOrganizationModel,
  IUserModel
} from '@interfaces';
import { BaseEntity } from './base-entity';
import { entity, field, userImmutable } from '@decorators';

@entity()
export class UserEntity
  extends BaseEntity<IUserModel>
  implements DbEntity<IUserModel>
{
  public static async seed(): Promise<IDbSeedData<IUserModel>> {
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

  private readonly _organizations: Readonly<Readonly<IOrganizationModel[]>> =
    [];

  private readonly _calendars: Readonly<Readonly<ICalendarModel>[]> = [];

  @field({
    type: DbColumnType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public firstName?: string;

  @field({
    type: DbColumnType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public lastName?: string;

  @field({
    type: DbColumnType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public email?: string;

  @field({
    type: DbColumnType.varchar,
    minLength: 1,
    maxLength: 1024,
    isSecured: true
  })
  @userImmutable
  public passwordHash?: string;

  @field({
    type: DbColumnType.varchar,
    minLength: 1,
    maxLength: 1024,
    isSecured: true
  })
  @userImmutable
  public passwordSalt?: string;

  public get calendars() {
    return this._calendars;
  }

  public get organizations() {
    return this._organizations;
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
