import { Role } from '@shared/enums';
import { registry } from '@shared/utilities';
import Router from 'express-promise-router';
import { authenticateToken, authenticateTokenWithRole } from 'src/utilities';
import { DependencyInjectionToken } from '../enums';
import { IUserModel, IUserService } from '../interfaces';

function userRouter() {
  // eslint-disable-next-line new-cap
  const router = Router();

  const userService = registry.inject<IUserService>(
    DependencyInjectionToken.userService
  )!;

  router.get<{ id: string }, unknown, IUserModel>(
    '/:id',
    authenticateToken,
    async (req, res) => {
      const model = await userService.get(req.params.id);

      return res.send(model);
    }
  );

  router.post<Record<string, unknown>, unknown, IUserModel>(
    '/create',
    authenticateTokenWithRole(Role.admin)
    async (req, res) => {
      
  });

  return router;
}

export { userRouter };
