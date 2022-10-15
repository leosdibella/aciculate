import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { authenticate, controller, route, routeParameter } from '@decorators';
import { ControllerName } from '@enums';
import {
  IOrganizationService,
  IOrganizationController,
  IUserContext,
  IHttpContext
} from '@interfaces';
import { inject } from '@shared/decorators';
import { HttpStatusCode, HttpVerb } from '@shared/enums';

@controller(ControllerName.organizationController)
export class OrganizationController implements IOrganizationController {
  readonly #organizationService: IOrganizationService;

  @authenticate()
  @route(HttpVerb.get, '/:id')
  public async get(@routeParameter('id') id: string) {
    try {
      const organization = await this.#organizationService.get(id);

      this.httpContext.sendResponse(organization);
    } catch {
      // TODO: Handle generic errors too, DB availability etc
      this.httpContext.sendError(HttpStatusCode.notFound);
    }
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpContext)
    public readonly httpContext: IHttpContext,
    @inject(dependencyInjectionTokens.userContext, true)
    public readonly userContext: Readonly<IUserContext> | undefined | null,
    @inject(dependencyInjectionTokens.userService)
    organizationService: IOrganizationService
  ) {
    this.#organizationService = organizationService;
  }
}
