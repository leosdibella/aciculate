import {
  IController,
  IControllerRoute,
  IApplicationContext,
  IDatabaseContext
} from '@interfaces';
import Router from 'express-promise-router';
import express from 'express';
import cors from 'cors';
import { HttpVerb } from '@shared/enums';
import { dependencyInjectionTokens, httpMetadataKeys } from '@data';
import { inject } from '@shared/decorators';
import { Constructor } from '@shared/types';
import { readFileSync } from 'fs';
import path from 'path';
import {
  createServer as createHttpsServer,
  Server as HttpsServer
} from 'https';
import { createServer as createHttpServer, Server as HttpServer } from 'http';

export class ApplicationContext implements IApplicationContext {
  static readonly #defaultPort = 8080;
  static readonly #defaultPortSsl = 8081;
  static readonly #defaultAppOrigin = 'http://localhost:8082';
  static readonly #defaultAppOriginSsl = `https://localhost:8083`;
  static readonly #defaultSslKeyFilePath = '../../../key.pem';
  static readonly #defaultSslCertFilePath = '../../../cert.pem';

  static readonly #useSsl =
    (
      process.env.ACICULATE_USE_SSL ??
      process.env.useSsl ??
      'false'
    ).toLowerCase() === 'true';

  static readonly #port = +(ApplicationContext.#useSsl
    ? process.env.ACICULATE_API_PORT_SSL ?? ApplicationContext.#defaultPortSsl
    : process.env.ACICULATE_API_PORT ?? ApplicationContext.#defaultPort);

  static readonly #appOrigin = ApplicationContext.#useSsl
    ? process.env.ACICULATE_APP_ORIGIN_SSL ??
      ApplicationContext.#defaultAppOriginSsl
    : process.env.ACICULATE_APP_ORIGIN ?? ApplicationContext.#defaultAppOrigin;

  static readonly #sslKeyFilePath =
    process.env.ACICULATE_API_SSL_KEY_FILEPATH ??
    ApplicationContext.#defaultSslKeyFilePath;

  static readonly #sslCertFilePath =
    process.env.ACICULATE_API_SSL_CERT_FILEPATH ??
    ApplicationContext.#defaultSslCertFilePath;

  readonly #databaseContext: IDatabaseContext;
  readonly #express = express();

  #server?: HttpServer | HttpsServer;

  #wireController<T extends IController>(
    controllerConstructor: Constructor<T>
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
      router[r.httpVerb](r.path, r.action);
    });

    this.#express.use(routePrefix, router);
  }

  public async startApi() {
    if (this.#server) {
      return;
    }

    await this.#databaseContext.migrate();

    this.#express.use(
      cors({
        origin: ApplicationContext.#appOrigin,
        optionsSuccessStatus: 200,
        methods: Object.keys(HttpVerb)
          .map((v) => v.toUpperCase())
          .join()
      })
    );

    this.#express.use(express.json());

    if (ApplicationContext.#useSsl) {
      const key = readFileSync(
        ApplicationContext.#sslKeyFilePath[0] === '/'
          ? ApplicationContext.#sslKeyFilePath
          : path.resolve(__dirname, ApplicationContext.#sslKeyFilePath)
      );

      const cert = readFileSync(
        ApplicationContext.#sslCertFilePath[0] === '/'
          ? ApplicationContext.#sslCertFilePath
          : path.resolve(__dirname, ApplicationContext.#sslCertFilePath)
      );

      this.#server = createHttpsServer({ key, cert }, this.#express);
    } else {
      this.#server = createHttpServer(this.#express);
    }

    this.#server.listen(ApplicationContext.#port, () => {
      console.log(
        `Aciculate API listening on port: ${ApplicationContext.#port}`
      );
    });
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext,
    @inject(dependencyInjectionTokens.controllers)
    controllers: Readonly<Constructor<IController>[]>
  ) {
    this.#databaseContext = databaseContext;

    controllers.forEach((c) => {
      this.#wireController(c);
    });
  }
}
