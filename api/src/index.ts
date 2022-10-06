import express from 'express';
import cors from 'cors';
import {
  calendarRouter,
  calendarEventRouter,
  organizationRouter
} from '@routers';
import { HttpVerb } from '@shared/enums';
import { registry } from '@shared/utilities';
import {
  IDbContext,
  IDbContextConstructor,
  IUserServiceConstructor
} from '@interfaces';
import { DbContext, UserService } from '@classes';
import { DependencyInjectionToken } from '@enums';
import { Entity } from '@shared/enums/entity';
import { exit } from 'process';

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

  registry.provide<express.Express>(
    DependencyInjectionToken.expressApplication,
    app
  );

  app.use(`/${Entity.calendar}`, calendarRouter);
  app.use(`/${Entity.calendarEvent}`, calendarEventRouter);
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
