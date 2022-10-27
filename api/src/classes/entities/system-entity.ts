import { Entity } from '@types';
import { ISeedData, ISystemModel } from '@interfaces';
import { BaseEntity } from './base-entity';
import { EntityName, FieldType } from '@enums';
import { entity, field } from '@decorators/database';

@entity(EntityName.system)
export class SystemEntity
  extends BaseEntity<ISystemModel>
  implements Entity<ISystemModel>
{
  public static seed(): ISeedData<ISystemModel> {
    return {
      values: [{ signature: new Date() }],
      conditions: ['deleted'],
      storeValues: true
    };
  }

  @field({
    type: FieldType.timestamptz
  })
  public readonly signature?: Date;

  public constructor(model: Partial<ISystemModel>) {
    super(model);

    this.signature = model.signature;
  }
}
