import { DependencyInjectionToken } from '@enums/dependency-injection-tokens';
import {
  IDbContext,
  IDbContextConstructor,
  IUserContext
} from '@interfaces/contexts';
import { registry } from '@shared/utilities';
import { Request, Response } from 'express';

export abstract class BaseController {
  public readonly dbContext: IDbContext;
  public readonly userContext?: Readonly<IUserContext> | null;
  public readonly response: Response;
  public readonly request: Request;

  public constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;

    this.userContext =
      response.locals.userContext &&
      typeof response.locals.userContext === 'object'
        ? Object.freeze({ ...response.locals.userContext })
        : response.locals.userContext === null
        ? response.locals.userContext
        : undefined;

    const DbContextConstructor = registry.inject<IDbContextConstructor>(
      DependencyInjectionToken.dbContextConstructor
    );

    if (!DbContextConstructor) {
      throw Error();
    }

    this.dbContext = new DbContextConstructor(this.userContext ?? undefined);
  }
}
