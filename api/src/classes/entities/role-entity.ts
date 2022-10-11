import { Entity } from '@types';
import { IRoleModel, ISeedData } from '@interfaces';
import { BaseEntity } from './base-entity';
import { Role } from '@shared/enums';
import { EntityName, FieldType } from '@enums';
import { entity, field } from '@decorators/database';

@entity(EntityName.role)
export class RoleEntity
  extends BaseEntity<IRoleModel>
  implements Entity<IRoleModel>
{
  private static readonly _values: Readonly<Partial<IRoleModel>>[];

  public static seed(): ISeedData<IRoleModel> {
    return {
      values: (Object.keys(Role) as Role[]).map((r) => ({ role: r })),
      conditions: ['role'],
      storeValues: true
    };
  }

  public static set values(values: Readonly<Readonly<Partial<IRoleModel>>[]>) {
    values.forEach((v) => RoleEntity._values.push(v));
  }

  public static get values(): Readonly<Readonly<Partial<IRoleModel>>[]> {
    return Object.freeze([...RoleEntity._values]);
  }

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly role?: Role;

  public constructor(model: Partial<IRoleModel>) {
    super(model);

    this.role = model.role;
  }
}
