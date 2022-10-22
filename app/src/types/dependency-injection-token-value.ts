import { HttpDependencies } from '@enums/http-dependencies';
import { ServiceName } from '@enums/serrivce-name';
import { IAuthenticationService, IHttpService } from '@interfaces/services';
import { DependencyInjectionTokenKey } from './dependency-injection-token-key';
import { HttpInterceptor } from './http-interceptor';

export type DependencyInjectionTokenValue<
  T extends DependencyInjectionTokenKey
> = T extends ServiceName.authenticationService
  ? IAuthenticationService
  : T extends ServiceName.httpService
  ? IHttpService
  : T extends HttpDependencies.httpInterceptors
  ? HttpInterceptor[]
  : never;
