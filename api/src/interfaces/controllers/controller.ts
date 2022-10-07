import { IUserContext } from '../contexts';
import { Request, Response } from 'express';

export interface IController {
  readonly userContext: Readonly<IUserContext> | undefined | null;
  readonly request: Request;
  readonly response: Response;
}
