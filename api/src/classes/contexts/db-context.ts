import { Pool } from 'pg';
import format from 'pg-format';
import { DbEntity, DbModel, DbSchema, DbTable } from '@types';
import {
  IBaseModel,
  IDbContext,
  IDbEntityConstructor,
  IOrganizationModel,
  IRoleModel,
  IUserContext,
  IUserModel
} from '@interfaces';
import {
  generateTableColumnDefinitions,
  getColumnNamesAndValues,
  validateColumnValues
} from '@utilities';
import { ApiError } from '@shared/classes';
import { ApiErrorCode, Role } from '@shared/enums';
import { DbTableName } from '@enums';
import {
  CalendarEntity,
  CalendarEventEntity,
  OrganizationCalendarEntity,
  OrganizationEntity,
  OrganizationUserRoleEntity,
  RoleEntity,
  UserEntity
} from '@classes/entities';

export class DbContext implements IDbContext {
  static readonly #dbPool = new Pool();

  static readonly #dbSchema: { [key in DbTableName]: DbSchema<DbModel<key>> } =
    Object.freeze({
      [DbTableName.calendar]: CalendarEntity.schema,
      [DbTableName.calendarEvent]: CalendarEventEntity.schema,
      [DbTableName.organization]: OrganizationEntity.schema,
      [DbTableName.user]: UserEntity.schema,
      [DbTableName.role]: RoleEntity.schema,
      [DbTableName.organizationCalendar]: OrganizationCalendarEntity.schema,
      [DbTableName.organizationUserRole]: OrganizationUserRoleEntity.schema
    });

  static readonly #seedableEntityConstructors: Readonly<
    Partial<{
      [key in DbTableName]: IDbEntityConstructor<DbModel<key>>;
    }>
  > = Object.freeze({
    [DbTableName.role]: RoleEntity,
    [DbTableName.user]: UserEntity,
    [DbTableName.organization]: OrganizationEntity
  });

  static readonly #seedingInsertionOrder = Object.freeze([
    DbTableName.user,
    DbTableName.organization,
    DbTableName.role
  ]);

  readonly #pool = DbContext.#dbPool;
  readonly #userContext?: IUserContext;

  public async get<T extends IBaseModel>(entity: DbEntity<T>) {
    const query = format(
      `SELECT * FROM ${entity.tableName} WHERE id = %L;`,
      entity.id
    );

    const result = await this.#pool.query<T>(query);

    if (result.rows.length !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseLookupError,
          message: `Record of type ${entity.tableName} with id = '${entity.id}' not found.`
        }
      ]);
    }

    return new (entity.constructor as IDbEntityConstructor<T>)(
      result.rows[0]
    ).toModel();
  }

  public async insert<T extends IBaseModel>(entity: DbEntity<T>) {
    if (entity.validateInsert) {
      entity.validateInsert();
    } else {
      validateColumnValues(entity);
    }

    const { columnNames, columnValues } = getColumnNamesAndValues(entity);

    if (this.#userContext) {
      columnNames.push('createdBy' as Extract<keyof T, string>);
      columnNames.push('updatedBy' as Extract<keyof T, string>);
      columnValues.push(this.#userContext.userId);
      columnValues.push(this.#userContext.userId);
    }

    const query = format(
      `INSERT INTO ${entity.tableName} (${columnNames.join()}) VALUES %L;`,
      columnValues
    );

    const result = await this.#pool.query(query);

    if (result.rows.length !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseInsertError,
          message: `Record of type ${
            entity.tableName
          } with value '${entity.toJson()}' could not be inserted.`
        }
      ]);
    }

    return new (entity.constructor as IDbEntityConstructor<T>)(
      result.rows[0] as T
    ).toModel();
  }

  public async update<T extends IBaseModel>(entity: DbEntity<T>) {
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
    columnValues.push(this.#userContext?.userId ?? null);

    const setters = columnNames
      .map((cn, i) => format('%s = %L', cn, columnValues[i]))
      .join();

    const query = format(
      `UPDATE ${entity.tableName} SET %s WHERE id = %L;`,
      setters,
      entity.id
    );

    const result = await this.#pool.query<T>(query);

    if (result.rowCount !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseInsertError,
          message: `Record of type ${
            entity.tableName
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

  public async hardDelete<T extends IBaseModel>(entity: DbEntity<T>) {
    const query = format(
      `DELETE FROM ${entity.tableName} WHERE id = %L;`,
      entity.id
    );

    const result = await this.#pool.query(query);

    if (result.rowCount !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseDeleteError,
          message: `Record of type ${entity.tableName} with id = '${entity.id}' was not deleted.`
        }
      ]);
    }

    return;
  }

  public async migrateSchema<T extends IBaseModel>(
    tableName: DbTable<T>,
    schema: DbSchema<T>
  ) {
    const { columns, indexes } = generateTableColumnDefinitions(
      tableName,
      schema
    );

    await this.#pool.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(',\n')});`
    );

    for (let i = 0; i < indexes.length; ++i) {
      await this.#pool.query(indexes[i]);
    }

    return;
  }

  public async seed<T extends IBaseModel>(
    EntityConstructor: IDbEntityConstructor<T>
  ) {
    if (!EntityConstructor.seed && !EntityConstructor.seedAsync) {
      return;
    }

    const seedData = EntityConstructor.seedAsync
      ? await EntityConstructor.seedAsync()
      : EntityConstructor.seed!();

    const values: T[] = [];

    for (let i = 0; i < seedData.conditions.length; ++i) {
      const conditions = seedData.conditions
        .map((c, j) => format('%s = %L', c, seedData.values[j][c]))
        .join(' AND ');

      const query = format(
        `SELECT * FROM ${EntityConstructor.tableName} WHERE %s;`,
        conditions
      );

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

    (Object.keys(DbContext.#dbSchema) as DbTableName[]).forEach((t) => {
      this.migrateSchema<DbModel<typeof t>>(t, DbContext.#dbSchema[t]);
    });

    for (let i = 0; i < DbContext.#seedingInsertionOrder.length; ++i) {
      const tableName = DbContext.#seedingInsertionOrder[i];

      const seedableConstructor =
        DbContext.#seedableEntityConstructors[tableName]!;

      const values = await this.seed<DbModel<typeof tableName>>(
        seedableConstructor as IDbEntityConstructor<DbModel<typeof tableName>>
      );

      switch (tableName) {
        case DbTableName.role:
          role = (values as IRoleModel[] | undefined)?.find(
            (r) => r.name === Role.superAdmin
          );

          break;
        case DbTableName.user:
          user = (values as IUserModel[] | undefined)?.[0];

          break;
        case DbTableName.organization:
          organization = (values as IOrganizationModel[] | undefined)?.[0];

          break;
        default:
          break;
      }
    }

    if (user && role && organization) {
      const organizationUserRole = new OrganizationUserRoleEntity({
        userId: user.id,
        organizationId: organization.id,
        roleId: role.id,
        createdBy: user.id,
        updatedBy: user.id
      });

      await this.insert(organizationUserRole);
    }
  }

  public constructor(userContext?: IUserContext) {
    this.#userContext = userContext;
  }
}
