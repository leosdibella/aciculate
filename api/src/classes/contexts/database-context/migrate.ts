import { EntityName, FieldType } from '@enums';
import {
  IBaseModel,
  IEntityConstructor,
  IForeignKey,
  IOrganizationModel,
  IRoleModel,
  ISeedData,
  IUserModel
} from '@interfaces';
import { ApiError } from '@shared/classes';
import { ApiErrorCode, Role } from '@shared/enums';
import { IApiError } from '@shared/interfaces';
import { isPositiveInteger } from '@shared/utilities';
import { Entities, EntityCache, EntityNameModel, Field } from '@types';
import { Pool } from 'pg';
import format from 'pg-format';
import { insertMany, insertSingle } from './mutate';

function _getSchemaConfigurationError<T extends IBaseModel>(
  entityName: EntityName,
  fieldName: Extract<keyof T, string>,
  field: Readonly<Field>,
  remainingText: string
) {
  return {
    errorCode: ApiErrorCode.datbaseSchemaConfigurationError,
    message: `Schema Configuration Error - Enttiy: ${entityName} with Field: ${fieldName} of Type: ${field.type}, ${remainingText}.`
  };
}

async function _seed<T extends IBaseModel>(
  entityConstructor: IEntityConstructor<T>,
  entityCache: EntityCache,
  pool: Pool,
  entities: Entities
) {
  const entityName = entityConstructor.entityName();

  if (!entityConstructor.seed) {
    return;
  }

  const seedData = (
    entityConstructor.seed.constructor.name === 'AsyncFunction'
      ? await entityConstructor.seed()
      : entityConstructor.seed()
  ) as ISeedData<T>;

  const validatedValues: Partial<T>[] = [];

  for (let i = 0; i < seedData.conditions.length; ++i) {
    const conditions = seedData.conditions
      .map((c, j) => format('%s = %L', c, seedData.values[j][c]))
      .join(' AND ');

    const query = format(`SELECT * FROM "${entityName}" WHERE %s;`, conditions);
    const result = await pool.query(query);

    if (!result.rows.length) {
      validatedValues.push(seedData.values[i]);
    }
  }

  const values = await insertMany(
    entityName,
    validatedValues as Partial<EntityNameModel<typeof entityName>>[],
    entities,
    pool,
    undefined
  );

  if (seedData.storeValues) {
    (entityCache[entityName] as unknown as Readonly<Readonly<T>[]>) =
      Object.freeze<Readonly<T>[]>(
        values.map((v) => Object.freeze<T>(v as unknown as T))
      );
  }

  return values;
}

function _validateFieldConfiguration<T extends IBaseModel>(
  entityName: EntityName,
  fieldName: Extract<keyof T, string>,
  field: Readonly<Field>
) {
  const errors: IApiError[] = [];
  let typeModifierText = '';

  if (field.type === FieldType.varchar) {
    if (!isPositiveInteger(field.maxLength) || field.maxLength !== Infinity) {
      errors.push(
        _getSchemaConfigurationError(
          entityName,
          fieldName,
          field,
          `maxLength: ${field.maxLength} is invalid, must be a postivie integer or ${Infinity}`
        )
      );
    }

    if (
      field.minLength !== undefined &&
      (!isPositiveInteger(field.minLength) ||
        field.minLength > field.maxLength ||
        field.minLength === Infinity)
    ) {
      errors.push(
        _getSchemaConfigurationError(
          entityName,
          fieldName,
          field,
          `minLength: ${field.minLength} is invalid, must be a finite positive integer with value strictly less than the maxLength: ${field.maxLength}`
        )
      );
    }

    typeModifierText = `(${
      isFinite(field.maxLength) ? field.maxLength : 'max'
    })`;
  }

  return {
    typeModifierText,
    errors
  };
}

function _generateFieldDefinitions<T extends IBaseModel>(
  entityConstructor: IEntityConstructor<T>
) {
  const schema = entityConstructor.schema();
  const entityName = entityConstructor.entityName();

  const fields: string[] = [];
  const apiErrors: IApiError[] = [];
  const indexes: string[] = [];

  (Object.keys(schema) as Extract<keyof T, string>[])
    .filter((k) => typeof schema[k] !== 'string' && !Array.isArray(schema[k]))
    .forEach((fieldName) => {
      const field = schema[fieldName] as Readonly<Field>;

      const { typeModifierText, errors } = _validateFieldConfiguration(
        entityName,
        fieldName,
        field
      );

      const forgienKey: Readonly<IForeignKey> | undefined =
        entityConstructor.foreignKeys()[fieldName];

      if (forgienKey) {
        indexes.push(
          `CREATE INDEX IF NOT EXISTS ${entityName}_${fieldName}_index ON "${entityName}" ("${fieldName}");`
        );
      }

      errors.forEach((e) => apiErrors.push(e));

      const isPrimaryKey = entityConstructor.primaryKey();
      const typeText = `${field.type}${typeModifierText}`;
      const primaryKeyText = isPrimaryKey === fieldName ? ' PRIMARY KEY ' : '';

      const defaultValue = isPrimaryKey
        ? 'uuid_generate_v4()'
        : field.defaultValue
        ? field.defaultValue
        : (field.type === FieldType.timestamptz ||
            field.type === FieldType.date) &&
          !field.isNullable
        ? 'now()'
        : undefined;

      const nullableText =
        field.isNullable || primaryKeyText ? '' : ' NOT NULL ';

      const defaultText = defaultValue ? ` DEFAULT ${defaultValue} ` : '';

      const forgienKeyText = forgienKey
        ? ` REFERENCES "${forgienKey.entityName}"("${forgienKey.fieldName}") `
        : '';

      const casecadeText = forgienKey?.cascadeOnDelete
        ? ' ON DELETE CASCADE '
        : '';

      fields.push(
        `"${fieldName}" ${typeText}${primaryKeyText}${nullableText}${defaultText}${forgienKeyText}${casecadeText};`
      );
    });

  if (apiErrors.length) {
    throw new ApiError(apiErrors);
  }

  return {
    fields,
    indexes
  };
}

async function _migrateSchema<T extends IBaseModel>(
  entityConstructor: IEntityConstructor<T>,
  pool: Pool
) {
  const { fields, indexes } = _generateFieldDefinitions(entityConstructor);

  await pool.query(
    `CREATE TABLE IF NOT EXISTS "${entityConstructor.entityName()}" (${fields.join(
      ',\n'
    )});`
  );

  for (let i = 0; i < indexes.length; ++i) {
    await pool.query(indexes[i]);
  }

  return;
}

export async function migrate(
  entities: Entities,
  pool: Pool,
  entityCache: EntityCache
) {
  let organization: IOrganizationModel | undefined;
  let user: IUserModel | undefined;
  let role: IRoleModel | undefined;

  const seedableEntities = Object.values(EntityName).filter(
    (entityName) => !!entities[entityName].seed
  );

  for (let i = 0; i < seedableEntities.length; ++i) {
    const entityName = seedableEntities[i];
    const seedableConstructor = entities[entityName];

    const values = await _seed<EntityNameModel<typeof entityName>>(
      seedableConstructor as IEntityConstructor<
        EntityNameModel<typeof entityName>
      >,
      entityCache,
      pool,
      entities
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
      entities[EntityName.organizationUserRole];

    // eslint-disable-next-line new-cap
    const organizationUserRole = new organizationUserRoleEntity({
      userId: user.id,
      organizationId: organization.id,
      roleId: role.id,
      createdBy: user.id,
      updatedBy: user.id
    });

    await insertSingle(
      EntityName.organizationUserRole,
      organizationUserRole,
      entities,
      pool,
      undefined
    );
  }

  Object.values(EntityName).forEach((t) => {
    const entityConstructor = entities[t] as IEntityConstructor<
      EntityNameModel<typeof t>
    >;

    _migrateSchema(entityConstructor, pool);
  });
}
