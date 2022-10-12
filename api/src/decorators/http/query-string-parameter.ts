import { IController, IQueryStringParameterMetadata } from '@interfaces';
import { httpMetadataKeys } from '@data';

export function queryStringParameter<T extends IController>(
  name: string,
  valueCoercer?: (value: string) => unknown
): ParameterDecorator {
  return function queryStringParameterDecorator(
    target: T,
    propertyKey: Extract<keyof T, string>,
    parameterIndex: number
  ) {
    const queryStringParametersDictionary: Partial<
      Record<
        Extract<keyof T, string>,
        Readonly<IQueryStringParameterMetadata>[]
      >
    > =
      Reflect.getMetadata(httpMetadataKeys.queryStringParameter, target) || {};

    if (!Array.isArray(queryStringParametersDictionary[propertyKey])) {
      queryStringParametersDictionary[propertyKey] = [];
    }

    queryStringParametersDictionary[propertyKey]!.push(
      Object.freeze<IQueryStringParameterMetadata>({
        parameterIndex,
        name,
        valueCoercer
      })
    );

    Reflect.defineMetadata(
      httpMetadataKeys.routeParameter,
      queryStringParametersDictionary,
      target
    );
  };
}
