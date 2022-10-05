import { DbContext } from '@classes/contexts';
import { DependencyInjectionToken } from '@enums/dependency-injection-tokens';
import {
  IDbContext,
  IDbContextConstructor,
  IUserContext
} from '@interfaces/contexts';
import { IOrganizationService } from '@interfaces/services';
import { registry } from '@shared/utilities';
import { OrganizationEntity } from '..';

export class OrganizationService implements IOrganizationService {
  readonly #dbContext: IDbContext;

  public async get(id: string) {
    return this.#dbContext.get(new OrganizationEntity({ id }));
  }

  public constructor(userContext: IUserContext) {
    const DbContextConstructor = registry.inject<IDbContextConstructor>(
      DependencyInjectionToken.dbContextConstructor,
      DbContext
    )!;

    this.#dbContext = new DbContextConstructor(userContext);
  }
}
