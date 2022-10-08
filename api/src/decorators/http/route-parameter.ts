import { httpMetadataKeys } from '@data';
import { IController, IRouteParameterMetadata } from '@interfaces';

export function routeParameter<T extends IController>(
  name: string,
  valueCoercer?: (value: string) => unknown
): ParameterDecorator {
  return function routeParameterDecorator(
    target: T,
    propertyKey: Extract<keyof T, string>,
    parameterIndex: number
  ) {
    const routeParametersDictionary: Partial<
      Record<Extract<keyof T, string>, Readonly<IRouteParameterMetadata>[]>
    > = Reflect.getMetadata(httpMetadataKeys.routeParameter, target) || {};

    if (!Array.isArray(routeParametersDictionary[propertyKey])) {
      routeParametersDictionary[propertyKey] = [];
    }

    routeParametersDictionary[propertyKey]!.push(
      Object.freeze({
        parameterIndex,
        name,
        valueCoercer
      })
    );

    Reflect.defineMetadata(
      httpMetadataKeys.routeParameter,
      routeParametersDictionary,
      target
    );
  };
}
