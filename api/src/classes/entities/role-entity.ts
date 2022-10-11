import { DbEntity } from '@types';
import { IRoleModel, IDbSeedData } from '@interfaces';
import { BaseEntity } from './base-entity';
import { Role } from '@shared/enums';
import { DbColumnType } from '@enums';
import { entity, field } from '@decorators/database';

@entity()
export class RoleEntity
  extends BaseEntity<IRoleModel>
  implements DbEntity<IRoleModel>
{
  private static readonly _values: Readonly<Partial<IRoleModel>>[];

  public static seed(): IDbSeedData<IRoleModel> {
    return {
      values: (Object.keys(Role) as Role[]).map((r) => ({ name: r })),
      conditions: ['name'],
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
    type: DbColumnType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly name?: Role;

  public constructor(model: Partial<IRoleModel>) {
    super(model);

    this.name = model.name;
  }
}
