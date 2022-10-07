import { IInjection } from '../interfaces';
import 'reflect-metadata';

export const injectMetadataKey = Symbol('inject');

export function inject(token: symbol): ParameterDecorator {
  return function injectDecorator(
    target: Record<string, unknown>,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    const injections: Readonly<IInjection>[] =
      Reflect.getMetadata(injectMetadataKey, target) || [];

    injections.push(
      Object.freeze({
        token,
        propertyKey,
        parameterIndex
      })
    );

    Reflect.defineMetadata(injectMetadataKey, injections, target);
  };
}
