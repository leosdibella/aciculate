import 'reflect-metadata';
import { exit } from 'process';
import { IApplicationContext } from '@interfaces';
import {
  DatabaseContext,
  ApplicationContext,
  UserEntity,
  RoleEntity,
  CalendarEntity,
  CalendarEventEntity,
  OrganizationCalendarEntity,
  OrganizationUserRoleEntity,
  OrganizationEntity,
  HttpContext
} from '@classes';
import { registry } from '@shared/utilities';
import { IRegistryValue } from '@shared/interfaces';
import { OrganizationController, UserController } from '@classes/controllers';
import { OrganizationService, UserService } from '@classes/services';
import { dependencyInjectionTokens } from '@data';
import {
  ApplicationDependency,
  ContextName,
  ControllerName,
  DatabaseDependency,
  EntityName,
  ServiceName
} from '@enums';
import {
  DependencyInjectionTokenKey,
  DependencyInjectionTokenKeyValue
} from '@types';

const _dependencies = Object.freeze<
  Partial<{
    [key in DependencyInjectionTokenKey]: IRegistryValue<
      DependencyInjectionTokenKeyValue<key>
    >;
  }>
>({
  [ContextName.applicationContext]: {
    value: ApplicationContext
  },
  [ContextName.httpContext]: {
    value: HttpContext
  },
  [ContextName.databaseContext]: {
    value: DatabaseContext
  },
  [ServiceName.userService]: {
    value: UserService
  },
  [ServiceName.organizationService]: {
    value: OrganizationService
  },
  [ControllerName.userController]: {
    value: UserController
  },
  [ControllerName.organizationController]: {
    value: OrganizationController
  },
  [ApplicationDependency.controllers]: {
    value: [UserController, OrganizationController]
  },
  [DatabaseDependency.databaseEntities]: {
    value: {
      [EntityName.user]: UserEntity,
      [EntityName.role]: RoleEntity,
      [EntityName.calendar]: CalendarEntity,
      [EntityName.organization]: OrganizationEntity,
      [EntityName.calendarEvent]: CalendarEventEntity,
      [EntityName.organizationCalendar]: OrganizationCalendarEntity,
      [EntityName.organizationUserRole]: OrganizationUserRoleEntity
    }
  },
  [DatabaseDependency.seedableEntities]: {
    value: [EntityName.role, EntityName.user, EntityName.organization]
  }
});

const _provisions = (() => {
  const registryValues: Partial<Record<symbol, Readonly<IRegistryValue>>> = {};

  Object.keys(_dependencies).forEach(
    (dependencyInjectionTokenKey: DependencyInjectionTokenKey) => {
      registryValues[dependencyInjectionTokens[dependencyInjectionTokenKey]] =
        Object.freeze(_dependencies[dependencyInjectionTokenKey]);
    }
  );

  return registryValues;
})();

registry.provideMany(_provisions);

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
