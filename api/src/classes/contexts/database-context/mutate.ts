import { EntityName } from '@enums';
import { IBaseModel, IUserContext, IEntityConstructor } from '@interfaces';
import { ApiError } from '@shared/classes';
import { ApiErrorCode } from '@shared/enums';
import { Entities, Entity, EntityNameModel } from '@types';
import { Pool } from 'pg';
import format from 'pg-format';
import { selectSingle } from './select';
import { validateFieldValues } from './validate';

function _getFieldNames<T extends IBaseModel>(
  entityConstructor: IEntityConstructor<T>,
  isUpdate: boolean,
  userContext: IUserContext | null | undefined
) {
  const fieldNames = (
    Object.keys(entityConstructor.schema()) as Extract<keyof T, string>[]
  ).filter(
    (fieldName) =>
      entityConstructor.userImmutableFields().indexOf(fieldName) === -1
  );

  if (isUpdate) {
    fieldNames.push('updatedDate' as Extract<keyof T, string>);
    fieldNames.push('updatedBy' as Extract<keyof T, string>);
  } else if (userContext) {
    fieldNames.push('createdBy' as Extract<keyof T, string>);
    fieldNames.push('updatedBy' as Extract<keyof T, string>);
  }

  return `(${fieldNames.map((fieldName) => `"${fieldName}"`).join()})`;
}

function _getFieldValues<T extends IBaseModel>(
  entityConstructor: IEntityConstructor<T>,
  entity: Entity<T>,
  userContext: IUserContext | null | undefined
) {
  const fieldValues = (
    Object.keys(entityConstructor.schema()) as Extract<keyof T, string>[]
  )
    .filter(
      (fieldName) =>
        entityConstructor.userImmutableFields().indexOf(fieldName) === -1
    )
    .map((fieldName) => format('%L', entity[fieldName]));

  if (entity.id) {
    fieldValues.push(format('%L', new Date()));
    fieldValues.push(format('%L', userContext?.userId ?? null));
  } else if (userContext) {
    fieldValues.push(format('%L', userContext.userId));
    fieldValues.push(format('%L', userContext.userId));
  }

  return fieldValues;
}

export async function insertSingle<T extends EntityName>(
  entityName: T,
  model: Partial<EntityNameModel<T>>,
  entities: Entities,
  pool: Pool,
  userContext: IUserContext | null | undefined
) {
  const entityConstructor = entities[entityName];

  // eslint-disable-next-line new-cap
  const entity = new entityConstructor(model);

  if (entity.validateInsert) {
    entity.validateInsert();
  } else {
    validateFieldValues(entity);
  }

  const fieldNames = _getFieldNames(entityConstructor, false, userContext);

  const fieldValues = _getFieldValues(
    entityConstructor,
    entity,
    userContext
  ).join();

  const query = format(
    `INSERT INTO "${entityName}"${fieldNames} VALUES %s RETURNING *;`,
    fieldValues
  );

  const result = await pool.query(query);

  if (result.rows.length !== 1) {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Record of type ${entityName} with value '${entity.toJson()}' could not be inserted.`
      }
    ]);
  }

  // eslint-disable-next-line new-cap
  return new entityConstructor(result.rows[0]).toModel();
}

export async function insertMany<T extends EntityName>(
  entityName: T,
  models: Partial<EntityNameModel<T>>[],
  entities: Entities,
  pool: Pool,
  userContext: IUserContext | null | undefined
) {
  if (!models.length) {
    return [];
  }

  const entityConstructor = entities[entityName];
  const fieldNames = _getFieldNames(entityConstructor, false, userContext);
  const fieldValues: string[] = [];

  for (let i = 0; i < models.length; ++i) {
    // eslint-disable-next-line new-cap
    const entity = new entityConstructor(models[i]);

    if (entity.validateInsert) {
      entity.validateInsert();
    } else {
      validateFieldValues(entity);
    }

    fieldValues.push(
      _getFieldValues(entityConstructor, entity, userContext).join()
    );
  }

  const query = format(
    `INSERT INTO "${entityName}"${fieldNames} VALUES %s RETURNING *;`,
    fieldValues.join(',\n')
  );

  const result = await pool.query(query);

  if (result.rows.length !== models.length) {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Records of type ${entityName}, could not be inserted. Only ${result.rows.length} of ${models.length} were added.`
      }
    ]);
  }

  // eslint-disable-next-line new-cap
  return result.rows.map((r) => new entityConstructor(r).toModel());
}

export async function updateSingle<T extends EntityName>(
  entityName: T,
  model: EntityNameModel<T>,
  entities: Entities,
  pool: Pool,
  userContext: IUserContext | null | undefined
) {
  const entityConstructor = entities[entityName];
  const oldModel = await selectSingle(entityName, model.id, entities, pool);

  // eslint-disable-next-line new-cap
  const entity = new entityConstructor(model);

  if (entity.validateUpdate) {
    entity.validateUpdate(oldModel);
  } else {
    validateFieldValues(entity, oldModel);
  }

  const fieldNames = _getFieldNames(entityConstructor, true, userContext);
  const fieldValues = _getFieldValues(entityConstructor, entity, userContext);

  const setters = fieldNames
    .split(',')
    .map((cn, i) => format('%s = %s', `"${cn}"`, fieldValues[i]))
    .join();

  const query = format(
    `UPDATE "${entityName}" SET %s WHERE "id" = %L RETURNING *;`,
    setters,
    entity.id
  );

  const result = await pool.query<EntityNameModel<T>>(query);

  if (result.rowCount !== 1) {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Record of type ${entityName} with value '${entity.toJson()}' could not be updated.`
      }
    ]);
  }

  // eslint-disable-next-line new-cap
  return new entityConstructor(result.rows[0]).toModel();
}

export async function deleteSingle<T extends EntityName>(
  entityName: T,
  id: string,
  hard: boolean,
  pool: Pool
) {
  if (hard) {
    const query = format(`DELETE FROM "${entityName}" WHERE "id" = %L;`, id);
    const result = await pool.query(query);

    if (result.rowCount !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseDeleteError,
          message: `Record of type ${entityName} with id = '${id}' was not deleted.`
        }
      ]);
    }
  } else {
    const query = format(
      `UPDATE "${entityName}" SET "deleted" = 1 WHERE "id" = %L;`,
      id
    );

    const result = await pool.query(query);

    if (result.rowCount !== 1) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.databaseDeleteError,
          message: `Record of type ${entityName} with id = '${id}' was not deleted.`
        }
      ]);
    }
  }
}
