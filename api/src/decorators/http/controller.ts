import { httpMetadataKeys, dependencyInjectionTokens } from '@data';
import { IUserContext } from '@interfaces/contexts';
import { IController, IControllerRoute } from '@interfaces/controllers';
import {
  IQueryStringParameterMetadata,
  IRequestBodyMetadata,
  IRouteMetdata,
  IRouteParameterMetadata
} from '@interfaces';
import { ApiError } from '@shared/classes';
import { ApiErrorCode, HttpStatusCode, HttpVerb } from '@shared/enums';
import { registry, toCamelCase } from '@shared/utilities';
import { decodeJwt } from '@utilities';
import { Request, Response } from 'express';
import { Constructor } from '@shared/types';
import { ControllerName } from '@enums';
import { Controller } from '@types';

const _mappedRoutes: Record<string, HttpVerb[]> = {};

function _resolveEndpointParameters<T extends IController>(
  endpoint: (...methodParameters: unknown[]) => void,
  request: Request,
  response: Response
): unknown[] {
  const endpointParameters: unknown[] = [...Array(endpoint.length)];
  const endpointName = endpoint.name as Extract<keyof T, string>;

  const requestBodies: Partial<
    Record<Extract<keyof T, string>, Readonly<IRequestBodyMetadata>>
  > = Reflect.getMetadata(httpMetadataKeys.requestBody, endpoint) ?? {};

  const requestBody = requestBodies[endpointName];

  if (requestBody) {
    const validator = requestBody.validator;

    if (validator) {
      try {
        validator(request.body);
      } catch (e: unknown) {
        response.status(HttpStatusCode.basRequest).send(e);
      }
    }

    endpointParameters[requestBody.parameterIndex] = request.body;
  }

  const queryStringParametersDictionary: Partial<
    Record<Extract<keyof T, string>, Readonly<IQueryStringParameterMetadata[]>>
  > =
    Reflect.getMetadata(httpMetadataKeys.queryStringParameter, endpoint) ?? {};

  const queryStringParameters =
    queryStringParametersDictionary[endpointName] ?? [];

  for (let i = 0; i < queryStringParameters.length; ++i) {
    const queryStringParameter = queryStringParameters[i];
    const queryStringValue = request.query[queryStringParameter.name] as string;

    endpointParameters[queryStringParameter.parameterIndex] =
      queryStringParameter.valueCoercer
        ? queryStringParameter.valueCoercer(queryStringValue)
        : queryStringValue;
  }

  const routeParametersDictionary: Partial<
    Record<Extract<keyof T, string>, Readonly<IRouteParameterMetadata[]>>
  > = Reflect.getMetadata(httpMetadataKeys.routeParameter, endpoint) ?? {};

  const routeParameters = routeParametersDictionary[endpointName] ?? [];

  for (let i = 0; i < routeParameters.length; ++i) {
    const routeParameter = routeParameters[i];
    const routeParameterValue = request.params[routeParameter.name];

    endpointParameters[routeParameter.parameterIndex] =
      routeParameter.valueCoercer
        ? routeParameter.valueCoercer(routeParameterValue)
        : routeParameterValue;
  }

  return endpointParameters;
}

export function controller<T extends ControllerName>(
  controllerName: T,
  routePrefixOverride?: string
) {
  return function controllerDecorator<S extends Constructor<Controller<T>>>(
    target: S
  ) {
    const routePrefix =
      routePrefixOverride ??
      toCamelCase(target.name.split('Controller')[0] ?? '');

    const routes: Readonly<IControllerRoute<Controller<T>>>[] = [];

    Object.getOwnPropertyNames(target.prototype).forEach(
      (actionName: Extract<keyof Controller<T>, string>) => {
        const property = target.prototype[actionName];

        if (typeof property === 'function') {
          const routeDictionary: Partial<
            Record<
              Extract<keyof Controller<T>, string>,
              Readonly<IRouteMetdata>
            >
          > = Reflect.getMetadata(httpMetadataKeys.route, target) ?? {};

          const route = routeDictionary[actionName];

          if (route) {
            const path = routePrefix + route.path;
            const existingRoutes = _mappedRoutes[path];

            if (existingRoutes) {
              if (existingRoutes.indexOf(route.httpVerb) === -1) {
                existingRoutes.push(route.httpVerb);
              } else {
                throw new ApiError([
                  {
                    errorCode: ApiErrorCode.duplicateRouteDefintion,
                    message: `Route: ${route} with ${route.httpVerb} has a duplicate defintion.`
                  }
                ]);
              }
            } else {
              _mappedRoutes[path] = [route.httpVerb];
            }

            const action = async (request: Request, response: Response) => {
              let userContext: IUserContext | undefined | null;
              const token = request.headers.authorization?.split(' ')[1];

              try {
                userContext = await decodeJwt(token);
              } catch (e: unknown) {
                if (e !== undefined) {
                  userContext = null;
                }
              }

              const controllerToken = dependencyInjectionTokens[controllerName];

              const httpController = registry.create<Controller<T>>(
                controllerToken,
                Object.freeze({
                  [dependencyInjectionTokens.httpRequest]: Object.freeze({
                    value: request
                  }),
                  [dependencyInjectionTokens.httpResponse]: Object.freeze({
                    value: response
                  }),
                  [dependencyInjectionTokens.userContext]: Object.freeze({
                    value: userContext
                  })
                })
              );

              const endpoint = httpController[actionName];

              if (typeof endpoint === 'function') {
                const endpointParameters = _resolveEndpointParameters(
                  endpoint as (...methodParameters: unknown[]) => void,
                  request,
                  response
                );

                if (endpoint.constructor.name === 'AsyncFunction') {
                  await endpoint(...endpointParameters);
                } else {
                  endpoint(...endpointParameters);
                }
              }
            };

            routes.push(
              Object.freeze<IControllerRoute<Controller<T>>>({
                ...route,
                action,
                actionName
              })
            );
          }
        }
      }
    );

    Reflect.defineMetadata(httpMetadataKeys.routePrefix, routePrefix, target);

    Reflect.defineMetadata(
      httpMetadataKeys.routes,
      Object.freeze<IControllerRoute<Controller<T>>[]>(routes),
      target
    );

    return target;
  };
}
