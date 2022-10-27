import {
  authenticate,
  controller,
  requestBody,
  route,
  routeParameter
} from '@decorators';
import { IUserController } from '@interfaces';
import { HttpVerb } from '@shared/enums';
import { IHttpContext, IUserContext } from '@interfaces/contexts';
import { ICreateUserRequest, IUserService } from '@interfaces/services';
import { inject } from '@shared/decorators';
import { dependencyInjectionTokens } from '@data';
import { ControllerName } from '@enums';
import { notFound, ok } from '@utilities';

@controller(ControllerName.userController)
export class UserController implements IUserController {
  readonly #userService: IUserService;

  @authenticate()
  @route(HttpVerb.get, '/:id')
  public async selectSingle(@routeParameter() id: string) {
    try {
      const user = await this.#userService.selectSingle(id);

      return ok(user);
    } catch {
      // TODO: Handle generic errors too, DB availability etc
      throw notFound();
    }
  }

  @route(HttpVerb.post)
  // TODO: Add validator
  public async insertSingle(
    @requestBody() createUserRequest: ICreateUserRequest
  ) {
    try {
      const user = await this.#userService.insertSingle(createUserRequest);

      return ok(user);
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
    @inject(dependencyInjectionTokens.userService)
    userService: IUserService
  ) {
    this.#userService = userService;
  }
}
