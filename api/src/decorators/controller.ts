import { httpRoutingMetadataKeys, dependencyInjectionTokens } from '@data';
import { IUserContext } from '@interfaces/contexts';
import { IController, IControllerRoute } from '@interfaces/controllers';
import { ApiError } from '@shared/classes';
import { ApiErrorCode, HttpStatusCode, HttpVerb } from '@shared/enums';
import { registry, toCamelCase } from '@shared/utilities';
import { ControllerConstructor } from '@types';
import { decodeJwt } from '@utilities';
import { Request, Response } from 'express';
import 'reflect-metadata';

const routeDictionary: Record<string, HttpVerb[]> = {};

function resolveEndpointParameters(
  endpoint: (...methodParameters: unknown[]) => void,
  request: Request,
  response: Response
): unknown[] {
  const endpointParameters: unknown[] = [...Array(endpoint.length)];

  const requestBody = Reflect.getMetadata(
    httpRoutingMetadataKeys.requestBody,
    endpoint
  );

  if (requestBody) {
    const requestBodyValidator = Reflect.getMetadata(
      httpRoutingMetadataKeys.requestBodyValidator,
      endpoint
    ) as ((data: unknown) => void) | undefined;

    if (requestBodyValidator) {
      try {
        requestBodyValidator(request.body);
      } catch (e: unknown) {
        response.status(HttpStatusCode.basRequest).send(e);
      }
    }

    endpointParameters[requestBody.parameterIndex] = request.body;
  }

  return endpointParameters;
}

export function httpController(
  metadataKey: symbol,
  routePrefixOverride?: string
) {
  return function httpControllerDecorator<T extends IController>(
    target: ControllerConstructor<T>
  ) {
    const routePrefix =
      routePrefixOverride ??
      toCamelCase(target.name.split('Controller')[0] ?? '');

    const routes: Readonly<IControllerRoute<T>>[] = [];

    Object.getOwnPropertyNames(target.prototype).forEach((pn) => {
      const property = target.prototype[pn];

      if (typeof property === 'function') {
        const routePath: string =
          Reflect.getMetadata(httpRoutingMetadataKeys.routePath, property) ||
          '';

        const httpVerb: HttpVerb | undefined = Reflect.getMetadata(
          httpRoutingMetadataKeys.httpVerb,
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

            const controller = registry.create<T>(
              metadataKey,
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

            const endpoint = controller[pn as keyof T];

            if (typeof endpoint === 'function') {
              const endpointParameters = resolveEndpointParameters(
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
            Object.freeze({
              httpVerb,
              route: routePath,
              action,
              actionName: pn as keyof T
            })
          );
        }
      }
    });

    Reflect.defineMetadata(
      httpRoutingMetadataKeys.routePrefix,
      routePrefix,
      target
    );

    Reflect.defineMetadata(
      httpRoutingMetadataKeys.routes,
      Object.freeze(routes),
      target
    );

    return target;
  };
}
