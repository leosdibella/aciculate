import { IDbContext, IUserContext } from '../contexts';
import { Request, Response } from 'express';

export interface IController {
  readonly dbContext: IDbContext;
  readonly userContext?: Readonly<IUserContext> | null;
  readonly request: Request;
  readonly response: Response;
}
