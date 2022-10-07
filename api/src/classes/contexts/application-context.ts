import {
  IController,
  IControllerRoute,
  IApplicationContext
} from '@interfaces';
import { ControllerConstructor } from '@types';
import Router from 'express-promise-router';
import express from 'express';
import cors from 'cors';
import { HttpVerb } from '@shared/enums';
import { DbContext } from './database-context';
import { registry } from '@shared/utilities';
import { IRegistryValue } from '@shared/interfaces';
import { UserController } from '../controllers';
import { OrganizationService, UserService } from '../services';
import { dependencyInjectionTokens, httpRoutingMetadataKeys } from '@data';

export class ApplicationContext implements IApplicationContext {
  static readonly #dependencies: Readonly<
    Partial<Record<symbol, Readonly<IRegistryValue>>>
  > = Object.freeze({
    [dependencyInjectionTokens.databaseContext]: Object.freeze({
      value: DbContext
    }),
    [dependencyInjectionTokens.userService]: Object.freeze({
      value: UserService
    }),
    [dependencyInjectionTokens.userController]: Object.freeze({
      value: UserController
    }),
    [dependencyInjectionTokens.organizationService]: Object.freeze({
      value: OrganizationService
    })
  });

  static readonly #controllers: Readonly<ControllerConstructor[]> =
    Object.freeze([UserController]);

  readonly #express = express();
  readonly #port = Number(process.env.ACICULATE_API_PORT);

  #registerDependencies() {
    registry.provideMany(ApplicationContext.#dependencies);

    registry.provide<IApplicationContext>(
      dependencyInjectionTokens.applicationContext,
      this
    );
  }

  #wireController<T extends IController>(
    controllerConstructor: ControllerConstructor<T>
  ) {
    // eslint-disable-next-line new-cap
    const router = Router();

    const routePrefix: string = Reflect.getMetadata(
      httpRoutingMetadataKeys.routePrefix,
      controllerConstructor
    );

    const controllerRoutes: Readonly<Readonly<IControllerRoute<T>>[]> =
      Reflect.getMetadata(
        httpRoutingMetadataKeys.routes,
        controllerConstructor
      );

    controllerRoutes.forEach((r) => {
      router[r.httpVerb](r.route, r.action);
    });

    this.#express.use(routePrefix, router);
  }

  #wireControllers() {
    ApplicationContext.#controllers.forEach((c) => {
      this.#wireController(c);
    });
  }

  public startApi() {
    this.#registerDependencies();
    this.#wireControllers();

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
}
