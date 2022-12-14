import {
  ApplicationDependency,
  ContextName,
  ControllerName,
  DatabaseDependency,
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
  ICalendarService,
  ICalendarController,
  ICalendarEventService,
  ICalendarEventController,
  IAuthenticationController,
  IAuthenticationService
} from '@interfaces';
import { Constructor } from '@shared/types';
import { Entities } from '../database';
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
  ? Readonly<IUserContext>
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
  : T extends ServiceName.authenticationService
  ? Constructor<IAuthenticationService>
  : T extends ControllerName.organizationController
  ? Constructor<IOrganizationController>
  : T extends ControllerName.userController
  ? Constructor<IUserController>
  : T extends ControllerName.calendarController
  ? Constructor<ICalendarController>
  : T extends ControllerName.calendarEventController
  ? Constructor<ICalendarEventController>
  : T extends ControllerName.authenticationController
  ? Constructor<IAuthenticationController>
  : T extends ApplicationDependency.controllers
  ? Readonly<Constructor<IController>[]>
  : T extends DatabaseDependency.entities
  ? Entities
  : never;
