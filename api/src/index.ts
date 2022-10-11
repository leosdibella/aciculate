import 'reflect-metadata';
import { exit } from 'process';
import {
  IApplicationContext,
  IController,
  IEntityConstructor
} from '@interfaces';
import {
  DatabaseContext,
  ApplicationContext,
  UserEntity,
  RoleEntity,
  CalendarEntity,
  CalendarEventEntity,
  OrganizationCalendarEntity,
  OrganizationUserRoleEntity,
  OrganizationEntity
} from '@classes';
import { registry } from '@shared/utilities';
import { IRegistryValue } from '@shared/interfaces';
import { UserController } from '@classes/controllers';
import { OrganizationService, UserService } from '@classes/services';
import { dependencyInjectionTokens } from '@data';
import { EntityName } from '@enums';
import { EntityNameModel } from '@types';
import { Constructor } from '@shared/types';

const _databaseEntities: Readonly<{
  [key in EntityName]: IEntityConstructor<EntityNameModel<key>>;
}> = Object.freeze({
  [EntityName.user]: UserEntity,
  [EntityName.role]: RoleEntity,
  [EntityName.calendar]: CalendarEntity,
  [EntityName.organization]: OrganizationEntity,
  [EntityName.calendarEvent]: CalendarEventEntity,
  [EntityName.organizationCalendar]: OrganizationCalendarEntity,
  [EntityName.organizationUserRole]: OrganizationUserRoleEntity
});

const _seedableEntities: Readonly<EntityName[]> = Object.freeze([
  EntityName.role,
  EntityName.user,
  EntityName.organization
]);

const _controllerDefintions: Readonly<Constructor<IController>[]> =
  Object.freeze([UserController]);

const _dependencies: Readonly<
  Partial<Record<symbol, Readonly<IRegistryValue>>>
> = Object.freeze({
  [dependencyInjectionTokens.applicationContext]: Object.freeze({
    value: ApplicationContext
  }),
  [dependencyInjectionTokens.databaseContext]: Object.freeze({
    value: DatabaseContext
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
  [dependencyInjectionTokens.controllerDefinitions]: Object.freeze({
    value: _controllerDefintions
  }),
  [dependencyInjectionTokens.databaseEntities]: Object.freeze({
    value: _databaseEntities
  }),
  [dependencyInjectionTokens.seedableEntities]: Object.freeze({
    value: _seedableEntities
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
