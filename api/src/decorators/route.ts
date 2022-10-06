import { MetadataKey } from '@enums/metadata-key';
import { IController } from '@interfaces/controllers';
import { HttpVerb } from '@shared/enums';
import 'reflect-metadata';

export function route(httpVerb: HttpVerb, path?: string) {
  return function routeDecorator(
    target: IController,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(MetadataKey.httpVerb, httpVerb, descriptor.value);
    Reflect.defineMetadata(MetadataKey.routePath, path || '', descriptor.value);
  };
}
