import { IDbContext, IUserContext } from '@interfaces/contexts';
import { IRoute } from '@interfaces/utilities/route';
import { HttpVerb } from '@shared/enums';
import { Request, Response } from 'express';

export class UserController {
  public static readonly routePrefix = 'user';

  public static readonly routes: Readonly<
    Record<keyof UserController, Readonly<IRoute>>
  > = Object.freeze({
    get: Object.freeze({
      httpVerb: HttpVerb.get,
      path: '/:id',
      handlers: []
    })
  });

  #regquestId: string;
  #userContext: IUserContext;
  #dbContext: IDbContext;

  public get(request: Request, response: Response) {
    
  }

  public constructor(
    requestId: string,
    userContext: IUserContext,
    dbContext: IDbContext
  ) {
    this.#regquestId = requestId;
    this.#userContext = userContext;
    this.#dbContext = dbContext;
  }
}
