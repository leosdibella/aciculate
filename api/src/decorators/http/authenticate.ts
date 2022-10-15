import { RoleEntity } from '@classes/entities';
import { IController } from '@interfaces/controllers';
import { ApiErrorCode, HttpStatusCode, Role } from '@shared/enums';

export function authenticate<T extends IController>(
  roles?: Role[]
): MethodDecorator {
  return function authenticateDecorator(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as (
      ...parameters: unknown[]
    ) => unknown;

    const authenticatedMethod = function authenticatedMethod(
      ...parameters: unknown[]
    ) {
      // eslint-disable-next-line @typescript-eslint/no-invalid-this, @typescript-eslint/no-this-alias
      const controllerInstance = this as IController;

      if (!controllerInstance.userContext) {
        controllerInstance.httpContext.sendError(
          controllerInstance.userContext === null
            ? HttpStatusCode.forbidden
            : HttpStatusCode.unauthorized,
          {
            errorCode: ApiErrorCode.invalidToken,
            message:
              target.userContext === null
                ? 'Missing authentication token'
                : 'Invalid authentication token'
          }
        );
      } else if (roles) {
        const role = RoleEntity.values.find(
          (r) => r.id === target.userContext!.roleId
        );

        if (!role || roles.indexOf(role.role!) === -1) {
          target.httpContext.sendError(HttpStatusCode.forbidden, {
            errorCode: ApiErrorCode.insufficientPermissionsError,
            message: `A role belonging to the set [${roles.join()}] is required to perform this operation.`
          });
        }
      }

      const value = originalMethod.apply(controllerInstance, parameters);

      return value;
    };

    descriptor.value = authenticatedMethod;
  };
}
