import { dependencyInjectionTokens } from '@data';
import { controller, requestBody } from '@decorators';
import { ControllerName } from '@enums';
import {
  IAuthenticationController,
  IAuthenticationService,
  IHttpContext,
  IUserContext
} from '@interfaces';
import { inject } from '@shared/decorators';
import { IAuthenticationRequest } from '@shared/interfaces';
import { badRequest, ok } from '@utilities';

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
