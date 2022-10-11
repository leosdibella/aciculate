import { DbEntity } from '@types';
import { BaseEntity } from './base-entity';
import { DbTableName, DbColumnType } from '@enums';
import { IOrganizationUserRoleModel } from '@interfaces';
import { entity, field, foreignKey } from '@decorators/database';

@entity()
export class OrganizationUserRoleEntity
  extends BaseEntity<IOrganizationUserRoleModel>
  implements DbEntity<IOrganizationUserRoleModel>
{
  @field({
    type: DbColumnType.uuid
  })
  @foreignKey({
    tableName: DbTableName.organization
  })
  public readonly organizationId?: string;

  @field({
    type: DbColumnType.uuid
  })
  @foreignKey({
    tableName: DbTableName.user
  })
  public readonly userId?: string;

  @field({
    type: DbColumnType.uuid
  })
  @foreignKey({
    tableName: DbTableName.role
  })
  public readonly roleId?: string;

  public constructor(model: Partial<IOrganizationUserRoleModel>) {
    super(model);

    this.organizationId = model.organizationId;
    this.userId = model.userId;
    this.roleId = model.roleId;
  }
}
