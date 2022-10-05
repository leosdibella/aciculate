import { Role } from '@shared/enums';
import { registry } from '@shared/utilities';
import Router from 'express-promise-router';
import { authenticateToken, authenticateTokenWithRole } from '@utilities';
import { DependencyInjectionToken } from '@enums';
import {
  ICreateUserRequest,
  IUserModel,
  IUserServiceConstructor
} from '@interfaces';
import { UserService } from '@classes/services';

function userRouter() {
  // eslint-disable-next-line new-cap
  const router = Router();

  const UserServiceConstructor = registry.inject<IUserServiceConstructor>(
    DependencyInjectionToken.userServiceConstructor,
    UserService
  )!;

  router.get<{ id: string }, unknown, IUserModel>(
    '/:id',
    authenticateToken,
    async (req, res) => {
      const model = await new UserServiceConstructor(
        res.locals.userContext
      ).get(req.params.id);

      return res.send(model);
    }
  );

  router.post<Record<string, unknown>, unknown, ICreateUserRequest>(
    '/create',
    authenticateTokenWithRole(Role.admin),
    async (req, res) => {
      const model = await new UserServiceConstructor(
        res.locals.userContext
      ).create(req.body);

      return res.send(model);
    }
  );

  return router;
}

export { userRouter };
