import { IController } from '@interfaces';
import { Request, Response } from 'express';

export type ControllerConstructor<T extends IController> = new (
  request: Request,
  response: Response
) => T;
