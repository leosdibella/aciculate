import { entity, field } from '@decorators/database';
import { EntityName, FieldType } from '@enums';
import { ISeedData, IOrganizationModel, IUserModel } from '@interfaces';
import { Entity } from '@types';
import { BaseEntity } from './base-entity';

@entity(EntityName.organization)
export class OrganizationEntity
  extends BaseEntity<IOrganizationModel>
  implements Entity<IOrganizationModel>
{
  public static seed(): ISeedData<IOrganizationModel> {
    return {
      values: [
        {
          title: process.env.ACICULATE_SYSTEM_ORGANIZATION,
          description: 'This is the administration organization'
        }
      ],
      conditions: ['title']
    };
  }

  @field({
    type: FieldType.json,
    isNullable: true
  })
  public readonly data?: Readonly<Record<string, unknown>> | null;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly title?: string;

  @field({
    type: FieldType.varchar,
    maxLength: 1024,
    isNullable: true
  })
  public readonly description?: string | null;

  public readonly users: Readonly<Readonly<IUserModel>[]>;

  public constructor(model: Partial<IOrganizationModel>) {
    super(model);

    this.title = model.title;
    this.description = model.description;
    this.users = model.users ?? [];
    this.data = model.data;
  }
}
