import { DependencyInjectionToken } from '@enums';
import { IHttpContext } from '@interfaces/contexts';
import { registry } from '@shared/utilities';

export const controller = (routePrefix: string) => {
  const httpContext = registry.inject<IHttpContext>(
    DependencyInjectionToken.httpContext
  )!;

  httpContext.

  return function (target: Function) {

  }
};
