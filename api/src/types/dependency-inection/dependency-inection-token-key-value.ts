import {
  ApplicationDependency,
  ContextName,
  ControllerName,
  DatabaseDependency,
  EntityName,
  ServiceName
} from '@enums';
import {
  IApplicationContext,
  IDatabaseContext,
  IHttpContext,
  IUserContext,
  IController,
  IOrganizationController,
  IUserController,
  IOrganizationService,
  IUserService,
  IEntityConstructor,
  ICalendarService,
  ICalendarController,
  ICalendarEventService,
  ICalendarEventController
} from '@interfaces';
import { Constructor } from '@shared/types';
import { EntityNameModel } from '../database';
import { DependencyInjectionTokenKey } from './dependency-injection-token-key';

export type DependencyInjectionTokenValue<
  T extends DependencyInjectionTokenKey
> = T extends ControllerName.userController
  ? Constructor<IUserController>
  : T extends ControllerName.organizationController
  ? Constructor<IOrganizationController>
  : T extends ContextName.applicationContext
  ? Constructor<IApplicationContext>
  : T extends ContextName.userContext
  ? IUserContext
  : T extends ContextName.databaseContext
  ? Constructor<IDatabaseContext>
  : T extends ContextName.httpContext
  ? Constructor<IHttpContext>
  : T extends ServiceName.organizationService
  ? Constructor<IOrganizationService>
  : T extends ServiceName.userService
  ? Constructor<IUserService>
  : T extends ServiceName.calendarService
  ? Constructor<ICalendarService>
  : T extends ServiceName.calendarEventService
  ? Constructor<ICalendarEventService>
  : T extends ControllerName.organizationController
  ? Constructor<IOrganizationController>
  : T extends ControllerName.userController
  ? Constructor<IUserController>
  : T extends ControllerName.calendarController
  ? Constructor<ICalendarController>
  : T extends ControllerName.calendarEventController
  ? Constructor<ICalendarEventController>
  : T extends ApplicationDependency.controllers
  ? Constructor<IController>[]
  : T extends DatabaseDependency.databaseEntities
  ? { [key in EntityName]: IEntityConstructor<EntityNameModel<key>> }
  : T extends DatabaseDependency.seedableEntities
  ? EntityName[]
  : never;
