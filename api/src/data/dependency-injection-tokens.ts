import { DependencyInjectionTokenKey } from '@types';

const httpRequest = Symbol('httpRequest');
const httpResponse = Symbol('httpResponse');
const userController = Symbol('userController');
const organizationController = Symbol('organizationController');
const userService = Symbol('userService');
const organizationService = Symbol('organizationService');
const databaseContext = Symbol('databaseContext');
const applicationContext = Symbol('applicationContext');
const userContext = Symbol('userContext');
const httpContext = Symbol('httpContext');
const controllers = Symbol('controllers');
const databaseEntities = Symbol('databaseEntities');
const seedableEntities = Symbol('seedableEntities');

export const dependencyInjectionTokens = Object.freeze<
  Record<DependencyInjectionTokenKey, symbol>
>({
  httpRequest,
  httpResponse,
  userService,
  organizationService,
  userController,
  organizationController,
  applicationContext,
  userContext,
  httpContext,
  databaseContext,
  seedableEntities,
  databaseEntities,
  controllers
});
