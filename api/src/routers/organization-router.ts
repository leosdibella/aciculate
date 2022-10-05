import { Role } from '@shared/enums';
import { registry } from '@shared/utilities';
import Router from 'express-promise-router';
import { authenticateToken, authenticateTokenWithRole } from '@utilities';
import { DependencyInjectionToken } from '@enums';
import {
  IOrganizationModel,
  IOrganizationServiceConstructor
} from '@interfaces';
import { Request, Response } from 'express';
import { OrganizationService } from '@classes/services';

function organizationRouter() {
  // eslint-disable-next-line new-cap
  const router = Router();

  const OrganizationServiceConstructor =
    registry.inject<IOrganizationServiceConstructor>(
      DependencyInjectionToken.organizationServiceConstructor,
      OrganizationService
    )!;

  router.get<{ id: string }, unknown, IOrganizationModel>(
    '/:id',
    authenticateToken,
    async (
      req: Request<IOrganizationModel>,
      res: Response<IOrganizationModel>
    ) => {
      const model = await new OrganizationServiceConstructor(
        res.locals.userContext
      ).get(req.params.id);

      return res.send(model);
    }
  );

  router.post<Record<string, unknown>, unknown, IOrganizationModel>(
    '/create',
    authenticateTokenWithRole(Role.admin),
    async (req, res) => {
      const model = await new OrganizationServiceConstructor(
        res.locals.userContext
      ).create(req.params.id);
    }
  );

  return router;
}

export { organizationRouter };
