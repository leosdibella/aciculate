import { EntityName, FieldType } from '@enums';
import { Entity } from '@types';
import { IUserPasswordModel } from '@interfaces';
import { BaseEntity } from './base-entity';
import { entity, field, foreignKey } from '@decorators';

@entity(EntityName.userPassword)
export class UserPasswordEntity
  extends BaseEntity<IUserPasswordModel>
  implements Entity<IUserPasswordModel>
{
  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.user
  })
  public readonly userId?: string;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 1024
  })
  public readonly hash?: string;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 1024
  })
  public readonly salt?: string;

  @field({
    type: FieldType.timestamptz
  })
  public readonly lastLoginDate?: Date;

  @field({
    type: FieldType.uuid
  })
  public readonly tokenSecret?: string;

  public constructor(model: Partial<IUserPasswordModel>) {
    super(model);

    this.userId = model.userId;
    this.hash = model.hash;
    this.salt = model.salt;
    this.lastLoginDate = model.lastLoginDate;
    this.tokenSecret = model.tokenSecret;
  }
}
