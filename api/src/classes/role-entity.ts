import { DbEntity } from '../types';
import { IRoleModel } from '../interfaces/role-model';
import { BaseEntity } from './base-entity';
import { Role } from '@shared/enums';
import { DbTableName, DbColumnType } from '../enums';
import { IDbSeedData } from 'src/interfaces';

export class RoleEntity
  extends BaseEntity<IRoleModel>
  implements DbEntity<IRoleModel>
{
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
      conditions: ['name']
    };
  }

  public readonly schema = RoleEntity.schema;
  public readonly tableName = DbTableName.role;
  public readonly name?: Role;

  public constructor(model: Partial<IRoleModel>) {
    super(model);

    this.name = model.name;
  }
}
