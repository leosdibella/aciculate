import { HttpVerb, Role } from '@shared/enums';
import { Request, Response } from 'express';

export interface IRoute {
  readonly httpVerb: HttpVerb;
  readonly path: string;
  readonly handlers: ((request: Request, response: Response) => void)[];
  readonly authenticate?: boolean;
  readonly roles?: Role[];
}
