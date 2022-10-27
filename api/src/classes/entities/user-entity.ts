import { EntityName, FieldType } from '@enums';
import { Entity } from '@types';
import {
  ICalendarModel,
  ISeedData,
  IOrganizationModel,
  IUserModel
} from '@interfaces';
import { BaseEntity } from './base-entity';
import { entity, field, foreignKey } from '@decorators';

@entity(EntityName.user)
export class UserEntity
  extends BaseEntity<IUserModel>
  implements Entity<IUserModel>
{
  public static seed(): ISeedData<IUserModel> {
    return {
      values: [
        {
          firstName: process.env.ACIULCATE_SYSTEM_USER_FIRSTNAME,
          lastName: process.env.ACIULCATE_SYSTEM_USER_LASTNAME,
          email: process.env.ACIULCATE_SYSTEM_USER_EMAIL
        }
      ],
      conditions: ['email']
    };
  }

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly firstName?: string;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly lastName?: string;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly email?: string;

  @field({
    type: FieldType.varchar,
    maxLength: Infinity,
    isNullable: true
  })
  public readonly profileImage?: string | null;

  @field({
    type: FieldType.uuid,
    isNullable: true
  })
  @foreignKey({
    entityName: EntityName.organization
  })
  public readonly defaulyOrganizationId?: string | null;

  @field({
    type: FieldType.timestamptz
  })
  public readonly signature?: Date;

  public readonly organizations: Readonly<Readonly<IOrganizationModel[]>>;
  public readonly calendars: Readonly<Readonly<ICalendarModel>[]>;

  public constructor(model: Partial<IUserModel>) {
    super(model);

    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = model.email;
    this.profileImage = model.profileImage;
    this.defaulyOrganizationId = model.defaulyOrganizationId;
    this.signature = model.signature;

    this.organizations =
      model.organizations ?? Object.freeze<Readonly<IOrganizationModel>>([]);

    this.calendars =
      model.calendars ?? Object.freeze<Readonly<ICalendarModel>>([]);
  }
}
