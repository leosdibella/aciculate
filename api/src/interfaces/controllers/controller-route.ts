import { HttpVerb } from '@shared/enums';
import { Request, Response } from 'express';
import { IController } from './controller';

export interface IControllerRoute<T extends IController> {
  readonly httpVerb: HttpVerb;
  readonly path: string;
  action(request: Request, response: Response): Promise<void>;
  readonly actionName: keyof T;
}
