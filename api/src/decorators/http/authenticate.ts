import { httpMetadataKeys } from '@data';
import { IController } from '@interfaces/controllers';
import { Role } from '@shared/enums';

export function authenticate<T extends IController>(
  roles: Role[] = []
): MethodDecorator {
  return function authenticateDecorator(
    target: T,
    propertyKey: Extract<keyof T, string>,
    descriptor: PropertyDescriptor
  ) {
    const authenticationDictionary: Partial<
      Record<Extract<keyof T, string>, Readonly<Role[]>>
    > =
      Reflect.getMetadata(httpMetadataKeys.authenticate, target.constructor) ??
      {};

    authenticationDictionary[propertyKey] = Object.freeze<Role[]>(roles);

    Reflect.defineMetadata(
      httpMetadataKeys.authenticate,
      authenticationDictionary,
      target.constructor
    );

    return descriptor;
  };
}
