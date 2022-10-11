import { entity, field } from '@decorators/database';
import { DbColumnType } from '@enums';
import { IDbSeedData, IOrganizationModel, IUserModel } from '@interfaces';
import { DbEntity } from '@types';
import { BaseEntity } from './base-entity';

@entity()
export class OrganizationEntity
  extends BaseEntity<IOrganizationModel>
  implements DbEntity<IOrganizationModel>
{
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

  @field({
    type: DbColumnType.json,
    isNullable: true
  })
  public readonly data?: Readonly<Record<string, unknown>> | null;

  @field({
    type: DbColumnType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly name?: string;

  @field({
    type: DbColumnType.varchar,
    maxLength: 1024,
    isNullable: true
  })
  public readonly description?: string | null;

  public readonly users: Readonly<Readonly<IUserModel>[]>;

  public constructor(model: Partial<IOrganizationModel>) {
    super(model);

    this.name = model.name;
    this.description = model.description;
    this.users = model.users ?? [];
    this.data = model.data;
  }
}
