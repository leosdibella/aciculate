import 'reflect-metadata';
import { IInjection } from '../interfaces';

export const injectMetadataKey = Symbol('inject');

export function inject(token: symbol, isOptional = false): ParameterDecorator {
  return function injectDecorator(
    target: Record<string, unknown>,
    propertyKey: string,
    parameterIndex: number
  ) {
    const injections: Readonly<IInjection>[] =
      Reflect.getMetadata(injectMetadataKey, target) || [];

    injections.push(
      Object.freeze<IInjection>({
        token,
        propertyKey,
        parameterIndex,
        isOptional
      })
    );

    Reflect.defineMetadata(injectMetadataKey, injections, target);
  };
}
