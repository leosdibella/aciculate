import { dependencyInjectionTokens } from '@data';
import {
  authenticate,
  controller,
  requestBody,
  routeParameter
} from '@decorators';
import { ControllerName } from '@enums';
import {
  IAuthenticationController,
  IAuthenticationService,
  IHttpContext,
  IUserContext
} from '@interfaces';
import { inject } from '@shared/decorators';
import { Role } from '@shared/enums';
import { IAuthenticationRequest } from '@shared/interfaces';
import { sanitizeDate } from '@shared/utilities';
import { badRequest, ok, unauthorized } from '@utilities';

@controller(ControllerName.authenticationController)
export class AuthenticationController implements IAuthenticationController {
  readonly #authenticationService: IAuthenticationService;

  public async authenticate(@requestBody() request: IAuthenticationRequest) {
    try {
      const response = await this.#authenticationService.authenticate(
        request.username,
        request.password
      );

      return ok(response);
    } catch (e: unknown) {
      // TODO
      throw badRequest();
    }
  }

  @authenticate([Role.superAdmin])
  async revokeSystemTokens(
    @routeParameter(undefined, sanitizeDate) reallowOn?: Date
  ) {
    if (!reallowOn) {
      // TODO
      throw badRequest();
    }

    try {
      await this.#authenticationService.revokeSystemTokens(reallowOn);

      return ok();
    } catch (e: unknown) {
      // TODO
      throw badRequest();
    }
  }

  @authenticate([Role.admin])
  async revokeOrganizationTokens(
    @routeParameter() organizationId: string,
    @routeParameter(undefined, sanitizeDate) reallowOn?: Date
  ) {
    if (organizationId !== this.userContext?.organizationId) {
      // TODO
      throw unauthorized();
    }

    if (!reallowOn) {
      // TODO
      throw badRequest();
    }

    try {
      await this.#authenticationService.revokeOrganizationTokens(
        organizationId,
        reallowOn
      );

      return ok();
    } catch (e: unknown) {
      // TODO
      throw badRequest();
    }
  }

  @authenticate()
  async revokeUserTokens(
    @routeParameter() userId: string,
    @routeParameter(undefined, sanitizeDate) reallowOn?: Date
  ) {
    if (!reallowOn) {
      // TODO
      throw badRequest();
    }

    try {
      await this.#authenticationService.revokeUserTokens(userId, reallowOn);

      return ok();
    } catch (e: unknown) {
      // TODO
      throw badRequest();
    }
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpContext)
    public readonly httpContext: IHttpContext,
    @inject(dependencyInjectionTokens.userContext, true)
    public readonly userContext: Readonly<IUserContext> | undefined | null,
    @inject(dependencyInjectionTokens.calendarService)
    authenticationService: IAuthenticationService
  ) {
    this.#authenticationService = authenticationService;
  }
}
