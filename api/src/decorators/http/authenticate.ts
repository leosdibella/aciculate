import { RoleEntity } from '@classes/entities';
import { IController } from '@interfaces/controllers';
import { ApiErrorCode, HttpStatusCode, Role } from '@shared/enums';

export function authenticate<T extends IController>(
  roles?: Role[]
): MethodDecorator {
  return function authenticateDecorator(target: T) {
    if (!target.userContext) {
      target.response
        .status(
          target.userContext === null
            ? HttpStatusCode.forbidden
            : HttpStatusCode.unauthorized
        )
        .send({
          errorCode: ApiErrorCode.invalidToken,
          message:
            target.userContext === null
              ? 'Missing authentication token'
              : 'Invalid authentication token'
        });
    } else if (roles) {
      const role = RoleEntity.values.find(
        (r) => r.id === target.userContext!.roleId
      );

      if (!role || roles.indexOf(role.name!) === -1) {
        target.response.status(HttpStatusCode.forbidden).send({
          errorCode: ApiErrorCode.insufficientPermissionsError,
          message: `A role belonging to the set [${roles.join()}] is required to perform this operation.`
        });
      }
    }
  };
}
