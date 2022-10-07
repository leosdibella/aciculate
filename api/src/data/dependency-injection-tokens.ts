const httpRequest = Symbol('httpRequest');
const httpResponse = Symbol('httpResponse');
const userController = Symbol('userController');
const userService = Symbol('userService');
const organizationService = Symbol('organizationService');
const databaseContext = Symbol('databaseContext');
const applicationContext = Symbol('applicationContext');
const userContext = Symbol('userContext');

export const dependencyInjectionTokens = Object.freeze({
  httpRequest,
  httpResponse,
  userService,
  organizationService,
  userController,
  userContext,
  databaseContext,
  applicationContext
});
