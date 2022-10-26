import { httpMetadataKeys } from '@data';
import { IController, IRouteMetdata } from '@interfaces';
import { HttpVerb } from '@shared/enums';

export function route<T extends IController>(
  httpVerb: HttpVerb,
  path = ''
): MethodDecorator {
  return function routeDecorator(
    target: T,
    propertyKey: Extract<keyof T, string>,
    descriptor: PropertyDescriptor
  ) {
    const routeDictionary: Partial<
      Record<Extract<keyof T, string>, Readonly<IRouteMetdata>>
    > = Reflect.getMetadata(httpMetadataKeys.route, target.constructor) ?? {};

    routeDictionary[propertyKey] = Object.freeze<IRouteMetdata>({
      httpVerb,
      path
    });

    Reflect.defineMetadata(
      httpMetadataKeys.route,
      routeDictionary,
      target.constructor
    );

    return descriptor;
  };
}
