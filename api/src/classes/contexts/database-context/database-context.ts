import { Pool } from 'pg';
import { Entities, EntityCache, EntityNameModel } from '@types';
import {
  IDatabaseContext,
  IUserContext,
  ISelectParameters,
  ISelectResponse
} from '@interfaces';
import { EntityName } from '@enums';
import { inject } from '@shared/decorators';
import { dependencyInjectionTokens } from '@data';
import { selectMany, selectSingle } from './select';
import { migrate } from './migrate';
import { deleteSingle, insertSingle, updateSingle } from './mutate';

export class DatabaseContext implements IDatabaseContext {
  static readonly #pool = new Pool();

  readonly #userContext: Readonly<IUserContext> | null | undefined;
  readonly #entityCache: EntityCache = {};
  readonly #entities: Entities;

  public async selectSingle<T extends EntityName>(entityName: T, id: string) {
    return selectSingle(entityName, id, this.#entities, DatabaseContext.#pool);
  }

  public async insertSingle<T extends EntityName>(
    entityName: T,
    model: Partial<EntityNameModel<T>>
  ) {
    return insertSingle(
      entityName,
      model,
      this.#entities,
      DatabaseContext.#pool,
      this.#userContext
    );
  }

  public async updateSingle<T extends EntityName>(
    entityName: T,
    model: EntityNameModel<T>
  ) {
    return updateSingle(
      entityName,
      model,
      this.#entities,
      DatabaseContext.#pool,
      this.#userContext
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public async deleteSingle<T extends EntityName>(
    entityName: T,
    id: string,
    hard = false
  ) {
    await deleteSingle(entityName, id, hard, DatabaseContext.#pool);
  }

  public async migrate() {
    await migrate(this.#entities, DatabaseContext.#pool, this.#entityCache);
  }

  public async selectMany<T extends EntityName>(
    parameters: ISelectParameters<T>
  ): Promise<ISelectResponse<T>> {
    return selectMany(
      parameters,
      this.#entities,
      this.#entityCache,
      DatabaseContext.#pool
    );
  }

  public constructor(
    @inject(dependencyInjectionTokens.entities)
    entities: Readonly<Entities>,
    @inject(dependencyInjectionTokens.userContext, true)
    userContext: Readonly<IUserContext> | null | undefined
  ) {
    this.#entities = entities;
    this.#userContext = userContext;
  }
}
