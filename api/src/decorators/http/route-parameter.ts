import { httpMetadataKeys } from '@data';
import { IController, IRouteParameterMetadata } from '@interfaces';

export function routeParameter<T extends IController>(
  name?: string,
  valueCoercer?: (value: string) => unknown
): ParameterDecorator {
  return function routeParameterDecorator(
    target: T,
    propertyKey: string,
    parameterIndex: number
  ) {
    const routeParametersDictionary: Partial<
      Record<string, Readonly<IRouteParameterMetadata>[]>
    > = Reflect.getMetadata(httpMetadataKeys.routeParameter, target) || {};

    if (!Array.isArray(routeParametersDictionary[propertyKey])) {
      routeParametersDictionary[propertyKey] = [];
    }

    routeParametersDictionary[propertyKey]!.push(
      Object.freeze<IRouteParameterMetadata>({
        parameterIndex,
        name: name ?? propertyKey,
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
