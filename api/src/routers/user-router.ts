import { registry } from '@shared/utilities';
import Router from 'express-promise-router';
import { CalendarEntity } from '../classes';
import { DependencyInjectionToken } from '../enums';
import { IDbContext, IUserModel } from '../interfaces';

// eslint-disable-next-line new-cap
const userRouter = Router();

userRouter.get('/:id', async (req, res) => {
  const id = req.params.id;

  const context = registry.inject<IDbContext>(
    DependencyInjectionToken.dbContext
  )!;

  const model = await context.get(new CalendarEntity({ id }));

  return res.send(model);
});

userRouter.post<Record<string, unknown>, unknown, IUserModel>(
  '/create',
  async (req, res) => {
    
});

export { userRouter };
