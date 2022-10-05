import { DbEntity } from '@types';
import { IRoleModel, IDbSeedData } from '@interfaces';
import { BaseEntity } from './base-entity';
import { Role } from '@shared/enums';
import { DbTableName, DbColumnType } from '@enums';

export class RoleEntity
  extends BaseEntity<IRoleModel>
  implements DbEntity<IRoleModel>
{
  static readonly #values: Partial<Readonly<IRoleModel>>[];

  public static readonly tableName = DbTableName.role;

  public static readonly schema = Object.freeze({
    ...BaseEntity._schema,
    name: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 512
    })
  });

  public static seed(): IDbSeedData<IRoleModel> {
    return {
      values: (Object.keys(Role) as Role[]).map((r) => ({ name: r })),
      conditions: ['name'],
      storeValues: true
    };
  }

  public static set values(values: Readonly<Readonly<Partial<IRoleModel>>[]>) {
    values.forEach((v) => RoleEntity.#values.push(v));
  }

  public static get values(): Readonly<Readonly<Partial<IRoleModel>>[]> {
    return Object.freeze([...RoleEntity.#values]);
  }

  public readonly schema = RoleEntity.schema;
  public readonly tableName = RoleEntity.tableName;
  public readonly name?: Role;

  public constructor(model: Partial<IRoleModel>) {
    super(model);

    this.name = model.name;
  }
}
