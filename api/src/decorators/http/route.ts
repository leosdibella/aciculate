import { httpMetadataKeys } from '@data';
import { IController } from '@interfaces/controllers';
import { IRouteMetdata } from '@interfaces/metadata';
import { HttpVerb } from '@shared/enums';

export function route<T extends IController>(
  httpVerb: HttpVerb,
  path = ''
): MethodDecorator {
  return function routeDecorator(
    target: T,
    propertyKey: Extract<keyof T, string>
  ) {
    const routeDictionary: Partial<
      Record<Extract<keyof T, string>, Readonly<IRouteMetdata>>
    > = Reflect.getMetadata(httpMetadataKeys.route, target) ?? {};

    routeDictionary[propertyKey] = Object.freeze<IRouteMetdata>({
      httpVerb,
      path
    });

    Reflect.defineMetadata(httpMetadataKeys.route, routeDictionary, target);
  };
}
