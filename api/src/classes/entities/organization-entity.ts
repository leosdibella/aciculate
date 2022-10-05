import { DbTableName, DbColumnType } from '@enums';
import { IDbSeedData, IOrganizationModel, IUserModel } from '@interfaces';
import { DbEntity } from '@types';
import { BaseEntity } from './base-entity';

export class OrganizationEntity
  extends BaseEntity<IOrganizationModel>
  implements DbEntity<IOrganizationModel>
{
  public static readonly tableName = DbTableName.organization;

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
    data: Object.freeze({
      type: DbColumnType.json,
      isNullable: true
    }),
    users: Object.freeze([])
  });

  public static seed(): IDbSeedData<IOrganizationModel> {
    return {
      values: [
        {
          name: process.env.ACICULATE_SYSTEM_ORGANIZATION,
          description: 'This is the administration organization'
        }
      ],
      conditions: ['name']
    };
  }

  public readonly schema = OrganizationEntity.schema;
  public readonly tableName = OrganizationEntity.tableName;
  public readonly data?: Readonly<Record<string, unknown>> | null;
  public readonly name?: string;
  public readonly description?: string | null;
  public readonly users: Readonly<Readonly<IUserModel>[]> = [];

  public constructor(model: Partial<IOrganizationModel>) {
    super(model);

    this.name = model.name;
    this.description = model.description;
    this.users = model.users ?? [];
    this.data = model.data;
  }
}
