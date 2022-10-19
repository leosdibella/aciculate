import { HttpError } from '@classes/errors';
import { httpMetadataKeys } from '@data';
import { IController } from '@interfaces/controllers';
import { IRouteMetdata } from '@interfaces/metadata';
import { IHttpResponse } from '@interfaces/utilities';
import { HttpVerb } from '@shared/enums';
import { Endpoint } from '@types';

export function route<T extends IController, S = unknown>(
  httpVerb: HttpVerb,
  path = ''
) {
  return function routeDecorator(
    target: T,
    propertyKey: Extract<keyof T, string>,
    descriptor: TypedPropertyDescriptor<Endpoint<S>>
  ) {
    const routeDictionary: Partial<
      Record<Extract<keyof T, string>, Readonly<IRouteMetdata>>
    > = Reflect.getMetadata(httpMetadataKeys.route, target) ?? {};

    routeDictionary[propertyKey] = Object.freeze<IRouteMetdata>({
      httpVerb,
      path
    });

    const originalMethod = descriptor.value as Endpoint;

    const httpMethod = async function httpMethod(...parameters: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-invalid-this, @typescript-eslint/no-this-alias
      const controllerInstance = this as IController;

      let response: IHttpResponse;

      try {
        if (originalMethod.constructor.name === 'AsyncFunction') {
          response = await originalMethod.apply(controllerInstance, parameters);
        } else {
          response = originalMethod.apply(controllerInstance, parameters);
        }

        target.httpContext.sendResponse(response);
      } catch (e: unknown) {
        if (e instanceof HttpError) {
          target.httpContext.sendResponse(e.value);
        }
      }
    };

    descriptor.value = httpMethod as unknown as Endpoint<S>;

    Reflect.defineMetadata(
      httpMetadataKeys.route,
      routeDictionary,
      target.constructor
    );
  };
}
