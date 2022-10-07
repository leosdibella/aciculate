import {
  authenticate,
  httpController,
  requestBody,
  route,
  routeParameter
} from '@decorators';
import { IUserController } from '@interfaces/controllers';
import { HttpStatusCode, HttpVerb } from '@shared/enums';
import { Request, Response } from 'express';
import { IUserContext } from '@interfaces/contexts';
import { ICreateUserRequest, IUserService } from '@interfaces/services';
import { inject } from '@shared/decorators';
import { dependencyInjectionTokens } from '@data';

@httpController(dependencyInjectionTokens.userController)
export class UserController implements IUserController {
  @authenticate()
  @route(HttpVerb.get, '/:id')
  public async get(@routeParameter('id') id: string) {
    try {
      const user = await this._userService.get(id);

      this.response.send(user);
    } catch {
      this.response.send(HttpStatusCode.notFound);
    }
  }

  @route(HttpVerb.post, '/create')
  public async create(@requestBody() createUserRequest: ICreateUserRequest) {
    try {
      const user = await this._userService.create(createUserRequest);

      this.response.send(user);
    } catch {
      // TODO
    }
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpRequest)
    public readonly request: Request,
    @inject(dependencyInjectionTokens.httpResponse)
    public readonly response: Response,
    @inject(dependencyInjectionTokens.userContext)
    public readonly userContext: Readonly<IUserContext> | undefined | null,
    @inject(dependencyInjectionTokens.userService)
    private readonly _userService: IUserService
  ) {}
}
