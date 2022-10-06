import { DependencyInjectionToken } from '@enums/dependency-injection-tokens';
import { MetadataKey } from '@enums/metadata-key';
import { IController } from '@interfaces/controllers';
import { ApiError } from '@shared/classes';
import { ApiErrorCode, HttpVerb } from '@shared/enums';
import { registry } from '@shared/utilities';
import { ControllerConstructor } from '@types';
import { decodeJwt } from '@utilities';
import { Express, Request, Response } from 'express';
import Router from 'express-promise-router';
import 'reflect-metadata';

const routeDictionary: Record<string, HttpVerb[]> = {};

export function httpController(routePrefixOverride?: string) {
  return function httpControllerDecorator<T extends IController>(
    target: ControllerConstructor<T>
  ) {
    // eslint-disable-next-line new-cap
    const router = Router();

    const routePrefix =
      routePrefixOverride ?? target.name.split('Controller')[0] ?? '';

    const expressApplication = registry.inject<Express>(
      DependencyInjectionToken.expressApplication
    );

    if (!expressApplication) {
      return target;
    }

    Object.getOwnPropertyNames(target.prototype).forEach((pn) => {
      const property = target.prototype[pn];

      if (typeof property === 'function') {
        const routePath: string =
          Reflect.getMetadata(MetadataKey.routePath, property) || '';

        const httpVerb: HttpVerb | undefined = Reflect.getMetadata(
          MetadataKey.httpVerb,
          property
        );

        if (httpVerb) {
          const route = routePrefix + routePath;
          const existingRoutes = routeDictionary[route];

          if (existingRoutes) {
            if (existingRoutes.indexOf(httpVerb) === -1) {
              existingRoutes.push(httpVerb);
            } else {
              throw new ApiError([
                {
                  errorCode: ApiErrorCode.duplicateRouteDefintion,
                  message: `Route: ${route} with ${httpVerb} has a duplicate defintion.`
                }
              ]);
            }
          } else {
            routeDictionary[route] = [httpVerb];
          }

          const handler = (request: Request, response: Response) => {
            // eslint-disable-next-line new-cap
            const controller = new target(request, response);
            const endpoint = controller[pn as keyof T];

            if (typeof endpoint === 'function') {
              endpoint(request, response);
            }
          };

          router[httpVerb](routePath, [decodeJwt, handler]);
        }
      }
    });

    expressApplication.use(routePrefix, router);

    return target;
  };
}
