import { httpMetadataKeys } from '@data';
import { IController, IRequestBodyMetadata } from '@interfaces';

export function requestBody<T extends IController>(
  validator?: (data: unknown) => void
): ParameterDecorator {
  return function requestBodyDecorator(
    target: T,
    propertyKey: Extract<keyof T, string>,
    parameterIndex: number
  ) {
    const requestBodyDictionary: Partial<
      Record<Extract<keyof T, string>, Readonly<IRequestBodyMetadata>>
    > = Reflect.getMetadata(httpMetadataKeys.requestBody, target) || {};

    requestBodyDictionary[propertyKey] = Object.freeze<IRequestBodyMetadata>({
      parameterIndex,
      validator
    });

    Reflect.defineMetadata(
      httpMetadataKeys.requestBody,
      requestBodyDictionary,
      target
    );
  };
}
