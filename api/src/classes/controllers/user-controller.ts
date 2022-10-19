import {
  authenticate,
  controller,
  requestBody,
  route,
  routeParameter
} from '@decorators';
import { IUserController, IUserModel } from '@interfaces';
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
  @route<IUserController, IUserModel>(HttpVerb.get, '/:id')
  public async get(@routeParameter('id') id: string) {
    try {
      const user = await this.#userService.get(id);

      return ok(user);
    } catch {
      // TODO: Handle generic errors too, DB availability etc
      throw notFound();
    }
  }

  @route<IUserController, IUserModel>(HttpVerb.post, '/create')
  // TODO: Add validator
  public async create(@requestBody() createUserRequest: ICreateUserRequest) {
    try {
      const user = await this.#userService.create(createUserRequest);

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
