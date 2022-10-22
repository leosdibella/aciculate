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
    maxLength: 1024,
    isSecured: true
  })
  public readonly passwordHash?: string;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 1024,
    isSecured: true
  })
  public readonly passwordSalt?: string;

  @field({
    type: FieldType.timestamptz
  })
  public readonly lastLoginDate?: Date;

  @field({
    type: FieldType.uuid,
    defaultValue: 'uuid_generate_v4()'
  })
  public readonly signature?: string;

  public constructor(model: Partial<IUserPasswordModel>) {
    super(model);

    this.userId = model.userId;
    this.passwordHash = model.passwordHash;
    this.passwordSalt = model.passwordSalt;
    this.lastLoginDate = model.lastLoginDate;
    this.signature = model.signature;
  }
}
