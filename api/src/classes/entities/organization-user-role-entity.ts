import { Entity } from '@types';
import { BaseEntity } from './base-entity';
import { EntityName, FieldType } from '@enums';
import { IOrganizationUserRoleModel } from '@interfaces';
import { entity, field, foreignKey } from '@decorators/database';

@entity(EntityName.organizationUserRole)
export class OrganizationUserRoleEntity
  extends BaseEntity<IOrganizationUserRoleModel>
  implements Entity<IOrganizationUserRoleModel>
{
  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.organization
  })
  public readonly organizationId?: string;

  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.user
  })
  public readonly userId?: string;

  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.role
  })
  public readonly roleId?: string;

  public constructor(model: Partial<IOrganizationUserRoleModel>) {
    super(model);

    this.organizationId = model.organizationId;
    this.userId = model.userId;
    this.roleId = model.roleId;
  }
}
