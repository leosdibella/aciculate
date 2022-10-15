import {
  authenticate,
  controller,
  requestBody,
  route,
  routeParameter
} from '@decorators';
import { IUserController } from '@interfaces';
import { HttpStatusCode, HttpVerb } from '@shared/enums';
import { IHttpContext, IUserContext } from '@interfaces/contexts';
import { ICreateUserRequest, IUserService } from '@interfaces/services';
import { inject } from '@shared/decorators';
import { dependencyInjectionTokens } from '@data';
import { ControllerName } from '@enums';

@controller(ControllerName.userController)
export class UserController implements IUserController {
  readonly #userService: IUserService;

  @authenticate()
  @route(HttpVerb.get, '/:id')
  public async get(@routeParameter('id') id: string) {
    try {
      const user = await this.#userService.get(id);

      this.httpContext.sendResponse(user);
    } catch {
      // TODO: Handle generic errors too, DB availability etc
      this.httpContext.sendError(HttpStatusCode.notFound);
    }
  }

  @route(HttpVerb.post, '/create')
  // TODO: Add validator
  public async create(@requestBody() createUserRequest: ICreateUserRequest) {
    try {
      const user = await this.#userService.create(createUserRequest);

      this.httpContext.sendResponse(user);
    } catch {
      // TODO: Handle generic errors too, DB availability etc
    }
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpContext)
    public readonly httpContext: IHttpContext,
    @inject(dependencyInjectionTokens.userContext, true)
    public readonly userContext: Readonly<IUserContext> | undefined | null,
    @inject(dependencyInjectionTokens.userService)
    userService: IUserService
  ) {
    this.#userService = userService;
  }
}
