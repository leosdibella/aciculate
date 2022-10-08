import { IApplicationContext } from '@interfaces';
import { DbContext, ApplicationContext } from '@classes';
import { exit } from 'process';
import { registry } from '@shared/utilities';
import { IRegistryValue } from '@shared/interfaces';
import { UserController } from '@classes/controllers';
import { OrganizationService, UserService } from '@classes/services';
import { dependencyInjectionTokens } from '@data';
import { ControllerConstructor } from './types/controller-constructor';
import 'reflect-metadata';

const _httpControllerDefintions: Readonly<ControllerConstructor[]> =
  Object.freeze([UserController]);

const _dependencies: Readonly<
  Partial<Record<symbol, Readonly<IRegistryValue>>>
> = Object.freeze({
  [dependencyInjectionTokens.applicationContext]: Object.freeze({
    value: ApplicationContext
  }),
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
  }),
  [dependencyInjectionTokens.httpControllerDefinitions]: Object.freeze({
    value: _httpControllerDefintions
  })
});

registry.provideMany(_dependencies);

const _applicationContext = registry.create<IApplicationContext>(
  dependencyInjectionTokens.applicationContext
);

_applicationContext
  .startApi()
  .then()
  .catch((e) => {
    console.log(e);
    exit(1);
  });
