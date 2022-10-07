import { httpRoutingMetadataKeys } from '@data';
import { IController } from '@interfaces/controllers';
import { HttpVerb } from '@shared/enums';
import 'reflect-metadata';

export function route(httpVerb: HttpVerb, path?: string): MethodDecorator {
  return function routeDecorator(
    target: IController,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(
      httpRoutingMetadataKeys.httpVerb,
      httpVerb,
      descriptor.value
    );

    Reflect.defineMetadata(
      httpRoutingMetadataKeys.routePath,
      path || '',
      descriptor.value
    );
  };
}
