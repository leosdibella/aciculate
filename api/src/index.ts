import 'reflect-metadata';
import { exit } from 'process';
import { IApplicationContext, IDbEntityConstructor } from '@interfaces';
import {
  DbContext,
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
import { DbTableName } from '@enums';
import { ControllerConstructor, DbModel } from '@types';

const _databaseEntities: Readonly<{
  [key in DbTableName]: IDbEntityConstructor<DbModel<key>>;
}> = Object.freeze({
  [DbTableName.user]: UserEntity,
  [DbTableName.role]: RoleEntity,
  [DbTableName.calendar]: CalendarEntity,
  [DbTableName.organization]: OrganizationEntity,
  [DbTableName.calendarEvent]: CalendarEventEntity,
  [DbTableName.organizationCalendar]: OrganizationCalendarEntity,
  [DbTableName.organizationUserRole]: OrganizationUserRoleEntity
});

const _seedableEntities: Readonly<DbTableName[]> = Object.freeze([
  DbTableName.role,
  DbTableName.user,
  DbTableName.organization
]);

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
