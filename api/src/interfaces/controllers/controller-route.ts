import { HttpVerb } from '@shared/enums';
import { Request, Response } from 'express';

export interface IControllerRoute {
  readonly httpVerb: HttpVerb;
  readonly path: string;
  action(request: Request, response: Response): Promise<void>;
}
