import express from 'express';
import cors from 'cors';
import {
  calendarRouter,
  calendarEventRouter,
  userRouter,
  organizationRouter
} from '@routers';
import { HttpVerb } from '@shared/enums';
import { registry } from '@shared/utilities';
import {
  IDbContext,
  IDbContextConstructor,
  IUserServiceConstructor
} from '@interfaces';
import { DbContext, UserController, UserService } from '@classes';
import { DependencyInjectionToken } from '@enums';
import { Entity } from '@shared/enums/entity';
import { exit } from 'process';
import { bindRoutes } from './utilities/bind-routes';

const dbContext: IDbContext = new DbContext();

function startApi() {
  registry.provide<IDbContextConstructor>(
    DependencyInjectionToken.dbContextConstructor,
    DbContext
  );

  registry.provide<IUserServiceConstructor>(
    DependencyInjectionToken.userServiceConstructor,
    UserService
  );

  const app = express();
  const port = Number(process.env.ACICULATE_API_PORT);

  app.use(
    cors({
      origin: process.env.ACICULATE_APP_ORIGIN,
      optionsSuccessStatus: 200,
      methods: Object.keys(HttpVerb)
        .map((v) => v.toUpperCase())
        .join()
    })
  );

  app.use(express.json());

  bindRoutes(UserController, app);

  app.use(`/${Entity.calendar}`, calendarRouter);
  app.use(`/${Entity.calendarEvent}`, calendarEventRouter);
  app.use(`/${Entity.user}`, userRouter());
  app.use(`/${Entity.organization}`, organizationRouter());

  app.listen(port, () => {
    console.log(`Aciculate API listening on port: ${port}`);
  });
}

dbContext
  .migrate()
  .then(() => startApi)
  .catch((e) => {
    console.log(e);
    exit(1);
  });
