import { EntityName } from '@enums';
import { ISelectParameters, ISelectResponse } from '@interfaces';
import { ApiError } from '@shared/classes';
import { ApiErrorCode } from '@shared/enums';
import { Entities, EntityCache, EntityNameModel } from '@types';
import { Pool } from 'pg';
import format from 'pg-format';

export async function selectSingle<T extends EntityName>(
  entityName: T,
  id: string,
  entities: Entities,
  pool: Pool
) {
  const entityConstructor = entities[entityName];
  const query = format(`SELECT * FROM "${entityName}" WHERE "id" = %L;`, id);
  const result = await pool.query<EntityNameModel<T>>(query);

  if (result.rows.length !== 1) {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databaseLookupError,
        message: `Record of type ${entityName} with id = '${id}' not found.`
      }
    ]);
  }

  // eslint-disable-next-line new-cap
  return new entityConstructor(result.rows[0]).toModel();
}

export async function selectMany<T extends EntityName>(
  parameters: ISelectParameters<T>,
  entities: Entities,
  entityCache: EntityCache,
  pool: Pool
): Promise<ISelectResponse<T>> {
  const entityName = parameters.entityName;
  const entityConstructor = entities[entityName];

  const cachedValues = entityCache[entityName] as
    | Readonly<Readonly<EntityNameModel<T>>[]>
    | undefined;

  if (cachedValues) {
    return {
      results: cachedValues,
      count: cachedValues.length
    };
  }

  if (parameters.organizationId) {
    const countQuery = format(
      `SELECT COUNT(*) FROM "${entityName}" AS "count" WHERE "organizationId" = %L;`,
      parameters.organizationId
    );

    const countResult = await pool.query<{ count: number }>(countQuery);

    const selectQuery = format(
      `SELECT * FROM "${entityName}" WHERE "organizationId" = %L;`,
      parameters.organizationId
    );

    const selectResult = await pool.query<EntityNameModel<T>>(selectQuery);

    const results = selectResult.rows.map((r) =>
      // eslint-disable-next-line new-cap
      new entityConstructor(r).toModel()
    );

    return {
      results,
      count: countResult.rows[0].count
    };
  }

  // TODO: implement this for generic orgs ... maybe idk yet
  return {
    results: [],
    count: 0
  };
}
