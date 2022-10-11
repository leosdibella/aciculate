import { Pool } from 'pg';
import format from 'pg-format';
import { Entity, EntityNameModel, EntitySchema, ModelEntityName } from '@types';
import {
  IBaseModel,
  IDatabaseContext,
  IEntityConstructor,
  ISeedData,
  IOrganizationModel,
  IRoleModel,
  IUserContext,
  IUserModel
} from '@interfaces';
import {
  generateColumnDefinitions,
  getColumnNamesAndValues,
  validateColumnValues
} from '@utilities';
import { ApiError } from '@shared/classes';
import { ApiErrorCode, Role } from '@shared/enums';
import { EntityName } from '@enums';
import { inject } from '@shared/decorators';
import { databaseMetadataKeys, dependencyInjectionTokens } from 'src/data';

export class DatabaseContext implements IDatabaseContext {
  static readonly #databasePool = new Pool();

  readonly #pool = DatabaseContext.#databasePool;

  public async get<T extends IBaseModel>(entity: Entity<T>) {
    const query = format(
      `SELECT * FROM ${entity.name} WHERE id = %L;`,
      entity.id
    );

    const result = await this.#pool.query<T>(query);

    if (result.rows.length !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseLookupError,
          message: `Record of type ${entity.name} with id = '${entity.id}' not found.`
        }
      ]);
    }

    return new (entity.constructor as IEntityConstructor<T>)(
      result.rows[0]
    ).toModel();
  }

  public async insert<T extends IBaseModel>(entity: Entity<T>) {
    if (entity.validateInsert) {
      entity.validateInsert();
    } else {
      validateColumnValues(entity);
    }

    const { columnNames, columnValues } = getColumnNamesAndValues(entity);

    if (this._userContext) {
      columnNames.push('createdBy' as Extract<keyof T, string>);
      columnNames.push('updatedBy' as Extract<keyof T, string>);
      columnValues.push(this._userContext.userId);
      columnValues.push(this._userContext.userId);
    }

    const query = format(
      `INSERT INTO ${entity.name} (${columnNames.join()}) VALUES %L;`,
      columnValues
    );

    const result = await this.#pool.query(query);

    if (result.rows.length !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseInsertError,
          message: `Record of type ${
            entity.name
          } with value '${entity.toJson()}' could not be inserted.`
        }
      ]);
    }

    return new (entity.constructor as IEntityConstructor<T>)(
      result.rows[0] as T
    ).toModel();
  }

  public async update<T extends IBaseModel>(entity: Entity<T>) {
    const oldModel = await this.get(entity);

    if (entity.validateUpdate) {
      entity.validateUpdate(oldModel);
    } else {
      validateColumnValues(entity, oldModel);
    }

    const { columnNames, columnValues } = getColumnNamesAndValues(entity);

    columnNames.push('updatedDate' as Extract<keyof T, string>);
    columnValues.push(new Date());
    columnNames.push('updatedBy' as Extract<keyof T, string>);
    columnValues.push(this._userContext?.userId ?? null);

    const setters = columnNames
      .map((cn, i) => format('%s = %L', cn, columnValues[i]))
      .join();

    const query = format(
      `UPDATE ${entity.name} SET %s WHERE id = %L;`,
      setters,
      entity.id
    );

    const result = await this.#pool.query<T>(query);

    if (result.rowCount !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseInsertError,
          message: `Record of type ${
            entity.name
          } with value '${entity.toJson()}' could not be updated.`
        }
      ]);
    }

    const newModel = { ...oldModel };

    columnNames.forEach((cn, i) => {
      newModel[cn] = columnValues[i] as T[Extract<keyof T, string>];
    });

    return newModel;
  }

  public async hardDelete<T extends IBaseModel>(entity: Entity<T>) {
    const query = format(
      `DELETE FROM ${entity.name} WHERE id = %L;`,
      entity.id
    );

    const result = await this.#pool.query(query);

    if (result.rowCount !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseDeleteError,
          message: `Record of type ${entity.name} with id = '${entity.id}' was not deleted.`
        }
      ]);
    }

    return;
  }

  public async migrateSchema<T extends IBaseModel>(
    entityName: ModelEntityName<T>,
    schema: EntitySchema<T>
  ) {
    const { columns, indexes } = generateColumnDefinitions(entityName, schema);

    await this.#pool.query(
      `CREATE TABLE IF NOT EXISTS ${entityName} (${columns.join(',\n')});`
    );

    for (let i = 0; i < indexes.length; ++i) {
      await this.#pool.query(indexes[i]);
    }

    return;
  }

  public async seed<T extends IBaseModel>(
    entityName: EntityName,
    EntityConstructor: IEntityConstructor<T>
  ) {
    if (!EntityConstructor.seed) {
      return;
    }

    const seedData = (
      EntityConstructor.seed.constructor.name === 'AsyncFunction'
        ? await EntityConstructor.seed()
        : EntityConstructor.seed()
    ) as ISeedData<T>;

    const values: T[] = [];

    for (let i = 0; i < seedData.conditions.length; ++i) {
      const conditions = seedData.conditions
        .map((c, j) => format('%s = %L', c, seedData.values[j][c]))
        .join(' AND ');

      const query = format(`SELECT * FROM ${entityName} WHERE %s;`, conditions);
      const result = await this.#pool.query(query);

      if (result.rows.length > 0) {
        continue;
      }

      values.push(await this.insert(new EntityConstructor(seedData.values[i])));
    }

    if (seedData.storeValues && EntityConstructor.values !== undefined) {
      EntityConstructor.values = Object.freeze(
        values.map((v) => Object.freeze(v))
      );
    }

    return values;
  }

  public async migrate() {
    let organization: IOrganizationModel | undefined;
    let user: IUserModel | undefined;
    let role: IRoleModel | undefined;

    (Object.keys(this._databaseEntities) as EntityName[]).forEach((t) => {
      const schema: EntitySchema<EntityNameModel<typeof t>> =
        Reflect.getMetadata(
          databaseMetadataKeys.field,
          this._databaseEntities[t].prototype
        );

      this.migrateSchema<EntityNameModel<typeof t>>(t, schema);
    });

    for (let i = 0; i < this._seedableEntities.length; ++i) {
      const entityName = this._seedableEntities[i];
      const seedableConstructor = this._databaseEntities[entityName];

      const values = await this.seed<EntityNameModel<typeof entityName>>(
        entityName,
        seedableConstructor as IEntityConstructor<
          EntityNameModel<typeof entityName>
        >
      );

      switch (entityName) {
        case EntityName.role:
          role = (values as IRoleModel[] | undefined)?.find(
            (r) => r.role === Role.superAdmin
          );

          break;
        case EntityName.user:
          user = (values as IUserModel[] | undefined)?.[0];

          break;
        case EntityName.organization:
          organization = (values as IOrganizationModel[] | undefined)?.[0];

          break;
        default:
          break;
      }
    }

    if (user && role && organization) {
      const organizationUserRoleEntity =
        this._databaseEntities[EntityName.organizationUserRole];

      // eslint-disable-next-line new-cap
      const organizationUserRole = new organizationUserRoleEntity({
        userId: user.id,
        organizationId: organization.id,
        roleId: role.id,
        createdBy: user.id,
        updatedBy: user.id
      });

      await this.insert(organizationUserRole);
    }
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseEntities)
    private readonly _databaseEntities: Readonly<{
      [key in EntityName]: IEntityConstructor<EntityNameModel<key>>;
    }>,
    @inject(dependencyInjectionTokens.seedableEntities)
    private readonly _seedableEntities: Readonly<EntityName[]>,
    @inject(dependencyInjectionTokens.userContext)
    private readonly _userContext: Readonly<IUserContext> | null | undefined
  ) {}
}
