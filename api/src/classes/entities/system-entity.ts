import { Entity } from '@types';
import { ISeedData, ISystemModel } from '@interfaces';
import { BaseEntity } from './base-entity';
import { EntityName, FieldType } from '@enums';
import { entity, field } from '@decorators/database';
import { randomUUID } from 'crypto';

@entity(EntityName.system)
export class SystemEntity
  extends BaseEntity<ISystemModel>
  implements Entity<ISystemModel>
{
  public static seed(): ISeedData<ISystemModel> {
    return {
      values: [{ signature: randomUUID() }],
      conditions: ['deleted'],
      storeValues: true
    };
  }

  @field({
    type: FieldType.uuid,
    defaultValue: 'uuid_generate_v4()'
  })
  public readonly signature?: string;

  public constructor(model: Partial<ISystemModel>) {
    super(model);

    this.signature = model.signature;
  }
}
