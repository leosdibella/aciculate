import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { authenticate, controller, route, routeParameter } from '@decorators';
import { ControllerName } from '@enums';
import {
  IOrganizationService,
  IOrganizationController,
  IUserContext,
  IHttpContext,
  IOrganizationModel
} from '@interfaces';
import { inject } from '@shared/decorators';
import { HttpVerb } from '@shared/enums';
import { notFound, ok } from '@utilities';

@controller(ControllerName.organizationController)
export class OrganizationController implements IOrganizationController {
  readonly #organizationService: IOrganizationService;

  @authenticate()
  @route<IOrganizationController, IOrganizationModel>(HttpVerb.get, '/:id')
  public async get(@routeParameter('id') id: string) {
    try {
      const organization = await this.#organizationService.get(id);

      return ok(organization);
    } catch {
      // TODO: Handle generic errors too, DB availability etc
      throw notFound();
    }
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpContext)
    public readonly httpContext: IHttpContext,
    @inject(dependencyInjectionTokens.userContext, true)
    public readonly userContext: Readonly<IUserContext> | undefined | null,
    @inject(dependencyInjectionTokens.organizationService)
    organizationService: IOrganizationService
  ) {
    this.#organizationService = organizationService;
  }
}
