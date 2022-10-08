import { dependencyInjectionTokens } from '@data';
import { IDbContext } from '@interfaces/contexts';
import { IOrganizationService } from '@interfaces/services';
import { inject } from '@shared/decorators';
import { OrganizationEntity } from '@classes/entities';

export class OrganizationService implements IOrganizationService {
  readonly #databaseContext: IDbContext;

  public async get(id: string) {
    return this.#databaseContext.get(new OrganizationEntity({ id }));
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDbContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
