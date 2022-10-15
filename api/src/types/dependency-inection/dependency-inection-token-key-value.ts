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
  IEntityConstructor
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
  : T extends ControllerName.organizationController
  ? Constructor<IOrganizationController>
  : T extends ControllerName.userController
  ? Constructor<IUserController>
  : T extends ApplicationDependency.controllers
  ? Constructor<IController>[]
  : T extends DatabaseDependency.databaseEntities
  ? { [key in EntityName]: IEntityConstructor<EntityNameModel<key>> }
  : T extends DatabaseDependency.seedableEntities
  ? EntityName[]
  : never;
