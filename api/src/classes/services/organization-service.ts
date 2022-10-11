import { dependencyInjectionTokens } from '@data';
import { IDatabaseContext } from '@interfaces/contexts';
import { IOrganizationService } from '@interfaces/services';
import { inject } from '@shared/decorators';
import { OrganizationEntity } from '@classes/entities';

export class OrganizationService implements IOrganizationService {
  readonly #databaseContext: IDatabaseContext;

  public async get(id: string) {
    return this.#databaseContext.get(new OrganizationEntity({ id }));
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
