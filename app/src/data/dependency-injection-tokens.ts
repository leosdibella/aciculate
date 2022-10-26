import { DependencyInjectionTokenKey } from '@types';

const httpService = Symbol('httpService');
const authenticationService = Symbol('authenticationService');
/*const userService = Symbol('userService');
const calendarService = Symbol('calendarService');
const calendarEventService = Symbol('calendarEventService');
const organizationService = Symbol('organizationService');*/
const httpInterceptors = Symbol('httpInterceptors');

export const dependencyInjectionTokens = Object.freeze<
  Record<DependencyInjectionTokenKey, symbol>
>({
  httpService,
  httpInterceptors,
  /*userService,
  calendarService,
  organizationService,
  calendarEventService,*/
  authenticationService
});
