import { IControllerConstructor } from '@interfaces/utilities';
import { Express, Request, Response } from 'express';
import Router from 'express-promise-router';
import { NextFunction } from 'express-serve-static-core';
import { authenticate, authorize } from './authentication';

export function bindRoutes<T>(
  controllerConstructor: IControllerConstructor<T>,
  expressApplication: Express
) {
  // eslint-disable-next-line new-cap
  const router = Router();

  (
    Object.keys(controllerConstructor.routes) as Extract<keyof T, string>[]
  ).forEach((k) => {
    const route = controllerConstructor.routes[k];

    const handlers: ((
      request: Request,
      response: Response,
      next: NextFunction
    ) => void)[] = [];

    if (route.authenticate) {
      handlers.push(authenticate);
    }

    if (route.roles) {
      handlers.push(authorize(route.roles));
    }

    handlers.push((request: Request, response: Response) => {
      // eslint-disable-next-line new-cap
      const controller = new controllerConstructor();

      controller[k](request, response);
    });

    router[route.httpVerb](route.path, [...handlers, ...route.handlers]);
  });

  expressApplication.use(controllerConstructor.routePrefix, router);
}
