import { httpMetadataKeys, dependencyInjectionTokens } from '@data';
import {
  IDatabaseContext,
  IUserContext,
  IController,
  IControllerRoute,
  IHttpResponse,
  IQueryStringParameterMetadata,
  IRequestBodyMetadata,
  IRouteMetdata,
  IRouteParameterMetadata
} from '@interfaces';
import { ApiError } from '@shared/classes';
import { ApiErrorCode, HttpStatusCode, HttpVerb, Role } from '@shared/enums';
import { registry, toCamelCase } from '@shared/utilities';
import { Request, Response } from 'express';
import { Constructor } from '@shared/types';
import { ControllerName, EntityName } from '@enums';
import { Controller } from '@types';
import { HttpError } from '@classes';
import { decodeJwt } from '@utilities';

const _mappedRoutes: Record<string, HttpVerb[]> = {};

async function _authenticate<T extends IController>(
  controllerInstance: T,
  databaseContext: IDatabaseContext,
  roles: Readonly<Role[]>
): Promise<IHttpResponse | undefined> {
  if (!controllerInstance.userContext) {
    return {
      httpStatusCode:
        controllerInstance.userContext === null
          ? HttpStatusCode.forbidden
          : HttpStatusCode.unauthorized,
      response: new ApiError([
        {
          errorCode: ApiErrorCode.invalidToken,
          message:
            controllerInstance.userContext === null
              ? 'Missing authentication token'
              : 'Invalid authentication token'
        }
      ])
    };
  }

  const invalidTokenResponse: IHttpResponse = {
    httpStatusCode: HttpStatusCode.forbidden,
    response: new ApiError([
      {
        errorCode: ApiErrorCode.invalidToken,
        message: 'Invalid authentication token'
      }
    ])
  };

  // Verify that the token has not been revoked
  try {
    const systemModel = (
      await databaseContext.selectMany({
        entityName: EntityName.system,
        take: 1
      })
    ).results[0];

    if (
      systemModel?.signature.getTime() !==
      controllerInstance.userContext.systemSignature.getTime()
    ) {
      return invalidTokenResponse;
    }

    const organizationModel = await databaseContext.selectSingle(
      EntityName.organization,
      controllerInstance.userContext.organizationId
    );

    if (
      organizationModel.signature.getTime() !==
      controllerInstance.userContext.organizationSignature.getTime()
    ) {
      return invalidTokenResponse;
    }

    const userModel = await databaseContext.selectSingle(
      EntityName.user,
      controllerInstance.userContext.userId
    );

    if (
      userModel.signature.getTime() !==
      controllerInstance.userContext.userSignature.getTime()
    ) {
      return invalidTokenResponse;
    }
  } catch {
    return invalidTokenResponse;
  }

  if (roles.length) {
    const role = (
      await databaseContext.selectMany({
        entityName: EntityName.role
      })
    ).results.find((r) => r.id === controllerInstance.userContext!.roleId);

    if (!role || roles.indexOf(role.role!) === -1) {
      return {
        httpStatusCode: HttpStatusCode.forbidden,
        response: new ApiError([
          {
            errorCode: ApiErrorCode.insufficientPermissionsError,
            message: `A role belonging to the set [${roles.join()}] is required to perform this operation.`
          }
        ])
      };
    }
  }
}

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
        response.status(HttpStatusCode.badRequest).send(e);
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

export function controller<T extends ControllerName>(controllerName: T) {
  return function controllerDecorator<S extends Constructor<Controller<T>>>(
    target: S
  ) {
    const routePrefix = toCamelCase(
      controllerName.split('Controller')[0] ?? ''
    );

    const routes: Readonly<IControllerRoute>[] = [];

    const routeDictionary: Partial<
      Record<Extract<keyof Controller<T>, string>, Readonly<IRouteMetdata>>
    > = Reflect.getMetadata(httpMetadataKeys.route, target) ?? {};

    const authenticationDictionary: Partial<
      Record<Extract<keyof Controller<T>, string>, Readonly<Role[]>>
    > = Reflect.getMetadata(httpMetadataKeys.authenticate, target) ?? {};

    Object.keys(routeDictionary).forEach(
      (actionName: Extract<keyof Controller<T>, string>) => {
        const property = target.prototype[actionName];
        const roles = authenticationDictionary[actionName] ?? [];

        if (typeof property === 'function') {
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
              const xTokenSecret = request.headers['X-Aciculate-Token-Secret'];

              const tokenSecret =
                (Array.isArray(xTokenSecret)
                  ? xTokenSecret[0]
                  : xTokenSecret) ?? '';

              try {
                userContext = await decodeJwt(tokenSecret, token);
              } catch (e: unknown) {
                if (e !== undefined) {
                  userContext = null;
                }
              }

              const controllerToken = dependencyInjectionTokens[controllerName];

              const databaseContext = registry.construct<IDatabaseContext>(
                dependencyInjectionTokens.databaseContext,
                Object.freeze({
                  [dependencyInjectionTokens.userContext]: Object.freeze({
                    value: userContext
                  })
                })
              );

              const httpController = registry.construct<Controller<T>>(
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

              const authenticationError = await _authenticate(
                httpController,
                databaseContext,
                roles
              );

              if (authenticationError) {
                httpController.httpContext.sendResponse(authenticationError);
                return;
              }

              const endpoint = httpController[actionName];

              if (typeof endpoint === 'function') {
                const endpointParameters = _resolveEndpointParameters(
                  endpoint as (...methodParameters: unknown[]) => void,
                  request,
                  response
                );

                try {
                  const httpResponse = (
                    endpoint.constructor.name === 'AsyncFunction'
                      ? await endpoint(...endpointParameters)
                      : endpoint(...endpointParameters)
                  ) as IHttpResponse;

                  httpController.httpContext.sendResponse(httpResponse);
                } catch (e: unknown) {
                  if (e instanceof HttpError) {
                    httpController.httpContext.sendResponse(e.value);
                  }
                }
              }
            };

            routes.push(
              Object.freeze<IControllerRoute>({
                ...route,
                action
              })
            );
          }
        }
      }
    );

    Reflect.defineMetadata(httpMetadataKeys.routePrefix, routePrefix, target);

    Reflect.defineMetadata(
      httpMetadataKeys.routes,
      Object.freeze<IControllerRoute[]>(routes),
      target
    );

    return target;
  };
}
