import { DbEntity } from '@types';
import { BaseEntity } from './base-entity';
import { DbTableName, DbColumnType } from '@enums';
import { IOrganizationUserRoleModel } from '@interfaces';

export class OrganizationUserRoleEntity
  extends BaseEntity<IOrganizationUserRoleModel>
  implements DbEntity<IOrganizationUserRoleModel>
{
  public static readonly tableName = DbTableName.organizationUserRole;

  public static readonly schema = Object.freeze({
    ...BaseEntity._schema,
    userId: Object.freeze({
      type: DbColumnType.uuid,
      foreignKeyTable: DbTableName.user,
      foreignKeyColumn: 'id'
    }),
    organizationId: Object.freeze({
      type: DbColumnType.uuid,
      foreignKeyTable: DbTableName.organization,
      foreignKeyColumn: 'id'
    }),
    roleId: Object.freeze({
      type: DbColumnType.uuid,
      foreignKeyTable: DbTableName.role,
      foreignKeyColumn: 'id'
    })
  });

  public readonly schema = OrganizationUserRoleEntity.schema;
  public readonly tableName = OrganizationUserRoleEntity.tableName;

  public readonly organizationId?: string;
  public readonly userId?: string;
  public readonly roleId?: string;

  public constructor(model: Partial<IOrganizationUserRoleModel>) {
    super(model);

    this.organizationId = model.organizationId;
    this.userId = model.userId;
    this.roleId = model.roleId;
  }
}
