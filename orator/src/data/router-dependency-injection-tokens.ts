import { DependencyInjectionName } from '../enums';

const router = Symbol('router');

export const routerDependencyInjectionTokens = Object.freeze<
  Record<DependencyInjectionName, symbol>
>({
  router
});
