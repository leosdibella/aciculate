import {
  IController,
  IControllerRoute,
  IApplicationContext,
  IDbContext
} from '@interfaces';
import { ControllerConstructor } from '@types';
import Router from 'express-promise-router';
import express from 'express';
import cors from 'cors';
import { HttpVerb } from '@shared/enums';
import { dependencyInjectionTokens, httpMetadataKeys } from '@data';
import { inject } from '@shared/decorators';

export class ApplicationContext implements IApplicationContext {
  readonly #databaseContext: IDbContext;
  readonly #express = express();
  readonly #port = Number(process.env.ACICULATE_API_PORT);

  #wireController<T extends IController>(
    controllerConstructor: ControllerConstructor<T>
  ) {
    // eslint-disable-next-line new-cap
    const router = Router();

    const routePrefix: string = Reflect.getMetadata(
      httpMetadataKeys.routePrefix,
      controllerConstructor
    );

    const controllerRoutes: Readonly<Readonly<IControllerRoute<T>>[]> =
      Reflect.getMetadata(httpMetadataKeys.routes, controllerConstructor);

    controllerRoutes.forEach((r) => {
      router[r.httpVerb](r.route, r.action);
    });

    this.#express.use(routePrefix, router);
  }

  public async startApi() {
    await this.#databaseContext.migrate();

    this.#express.use(
      cors({
        origin: process.env.ACICULATE_APP_ORIGIN,
        optionsSuccessStatus: 200,
        methods: Object.keys(HttpVerb)
          .map((v) => v.toUpperCase())
          .join()
      })
    );

    this.#express.use(express.json());

    this.#express.listen(this.#port, () => {
      console.log(`Aciculate API listening on port: ${this.#port}`);
    });
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDbContext,
    @inject(dependencyInjectionTokens.httpControllerDefinitions)
    httpControllers: Readonly<ControllerConstructor[]>
  ) {
    this.#databaseContext = databaseContext;

    httpControllers.forEach((c) => {
      this.#wireController(c);
    });
  }
}
