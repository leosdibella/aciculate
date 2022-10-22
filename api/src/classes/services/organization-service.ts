import { dependencyInjectionTokens } from '@data';
import { IDatabaseContext } from '@interfaces/contexts';
import { IOrganizationService } from '@interfaces/services';
import { inject } from '@shared/decorators';
import { EntityName } from '@enums/database';

export class OrganizationService implements IOrganizationService {
  readonly #databaseContext: IDatabaseContext;

  public async selectSingle(id: string) {
    return this.#databaseContext.selectSingle(EntityName.organization, id);
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
