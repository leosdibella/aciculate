import { DependencyInjectionTokenKey } from '@types';

const httpRequest = Symbol('httpRequest');
const httpResponse = Symbol('httpResponse');
const userController = Symbol('userController');
const calendarController = Symbol('calendarController');
const organizationController = Symbol('organizationController');
const calendarEventController = Symbol('calendarEventController');
const authenticationController = Symbol('authenticationController');
const userService = Symbol('userService');
const organizationService = Symbol('organizationService');
const calendarEventService = Symbol('calendarEventService');
const authenticationService = Symbol('authenticationService');
const calendarService = Symbol('calendarService');
const databaseContext = Symbol('databaseContext');
const applicationContext = Symbol('applicationContext');
const userContext = Symbol('userContext');
const httpContext = Symbol('httpContext');
const controllers = Symbol('controllers');
const entities = Symbol('entities');

export const dependencyInjectionTokens = Object.freeze<
  Record<DependencyInjectionTokenKey, symbol>
>({
  httpRequest,
  httpResponse,
  userService,
  calendarService,
  organizationService,
  calendarEventService,
  authenticationService,
  userController,
  calendarController,
  organizationController,
  calendarEventController,
  authenticationController,
  applicationContext,
  userContext,
  httpContext,
  databaseContext,
  entities,
  controllers
});
