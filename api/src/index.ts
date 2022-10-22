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
  UserPasswordEntity,
  HttpContext
} from '@classes';
import { registry } from '@shared/utilities';
import { IRegistryValue } from '@shared/interfaces';
import {
  CalendarController,
  CalendarEventController,
  OrganizationController,
  UserController
} from '@classes/controllers';
import {
  CalendarEventService,
  CalendarService,
  OrganizationService,
  UserService
} from '@classes/services';
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
  DependencyInjectionTokenValue
} from '@types';

const _dependencies = Object.freeze<
  Partial<{
    [key in DependencyInjectionTokenKey]: IRegistryValue<
      DependencyInjectionTokenValue<key>
    >;
  }>
>({
  [ContextName.applicationContext]: {
    value: ApplicationContext,
    isConstructor: true
  },
  [ContextName.httpContext]: {
    value: HttpContext,
    isConstructor: true
  },
  [ContextName.databaseContext]: {
    value: DatabaseContext,
    isConstructor: true
  },
  [ServiceName.userService]: {
    value: UserService,
    isConstructor: true
  },
  [ServiceName.calendarService]: {
    value: CalendarService,
    isConstructor: true
  },
  [ServiceName.calendarEventService]: {
    value: CalendarEventService,
    isConstructor: true
  },
  [ServiceName.organizationService]: {
    value: OrganizationService,
    isConstructor: true
  },
  [ControllerName.userController]: {
    value: UserController,
    isConstructor: true
  },
  [ControllerName.calendarController]: {
    value: CalendarController,
    isConstructor: true
  },
  [ControllerName.calendarEventController]: {
    value: CalendarEventController,
    isConstructor: true
  },
  [ControllerName.organizationController]: {
    value: OrganizationController,
    isConstructor: true
  },
  [ApplicationDependency.controllers]: {
    value: [
      UserController,
      CalendarController,
      OrganizationController,
      CalendarEventController
    ]
  },
  [DatabaseDependency.entities]: {
    value: {
      [EntityName.user]: UserEntity,
      [EntityName.role]: RoleEntity,
      [EntityName.calendar]: CalendarEntity,
      [EntityName.organization]: OrganizationEntity,
      [EntityName.calendarEvent]: CalendarEventEntity,
      [EntityName.userPassword]: UserPasswordEntity,
      [EntityName.organizationCalendar]: OrganizationCalendarEntity,
      [EntityName.organizationUserRole]: OrganizationUserRoleEntity
    }
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

const _applicationContext = registry.construct<IApplicationContext>(
  dependencyInjectionTokens.applicationContext
);

_applicationContext
  .startApi()
  .then()
  .catch((e) => {
    console.log(e);
    exit(1);
  });
