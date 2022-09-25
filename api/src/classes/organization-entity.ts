import { DbTableName, DbColumnType } from '../enums';
import { IOrganizationModel, IUserModel } from '../interfaces';
import { DbEntity } from '../types';
import { BaseEntity } from './base-entity';

export class OrganizationEntity
  extends BaseEntity<IOrganizationModel>
  implements DbEntity<IOrganizationModel>
{
  public static readonly schema = Object.freeze({
    ...BaseEntity._schema,
    name: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 512
    }),
    description: Object.freeze({
      type: DbColumnType.varchar,
      maxLength: 1024,
      isNullable: true
    }),
    users: Object.freeze([])
  });

  protected _users: IUserModel[] | null = null;

  public readonly schema = OrganizationEntity.schema;
  public readonly tableName = DbTableName.organization;
  public readonly name?: string;
  public readonly description?: string | null;

  public get users() {
    return this._users;
  }

  public constructor(model: Partial<IOrganizationModel>) {
    super(model);

    this.name = model.name;
    this.description = model.description;
  }
}
