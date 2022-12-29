import { IRegistryValue } from '@obelisk/interfaces';
import { registry } from '@obelisk/utilities';
import * as components from './classes/components';
import { dependencyInjectionTokens } from '@data';
import {
  DependencyInjectionTokenKey,
  DependencyInjectionTokenValue
} from '@types';
import { AuthenticationService, HttpService } from './services';
import { IHttpRequest, IHttpSimpleRequest } from './interfaces';
import { LocalStorageKey } from './enums';
import { CustomHeaderName } from '@shared/enums';

const _dependencies = Object.freeze<
  Partial<{
    [key in DependencyInjectionTokenKey]: IRegistryValue<
      DependencyInjectionTokenValue<key>
    >;
  }>
>({
  [dependencyInjectionTokens.httpService]: {
    value: HttpService,
    isConstructor: true
  },
  [dependencyInjectionTokens.authenticationService]: {
    value: AuthenticationService,
    isConstructor: true
  },
  [dependencyInjectionTokens.httpInterceptors]: {
    value: [
      (request: IHttpRequest | IHttpSimpleRequest) => {
        const token =
          localStorage.getItem(LocalStorageKey.authenticationToken) ?? '';

        const tokenSecret =
          localStorage.getItem(LocalStorageKey.authenticationTokenSecret) ?? '';

        const headers = {
          [CustomHeaderName.tokenSecret]: tokenSecret,
          authorization: `Bearer ${token}`,
          ...(request.headers ?? {})
        } as Record<string, string>;

        return {
          ...request,
          headers
        };
      }
    ]
  }
});

const _provisions = (() => {
  const registryValues: Partial<Record<symbol, Readonly<IRegistryValue>>> = {};

  Object.keys(_dependencies).forEach(
    (dependencyInjectionTokenKey: DependencyInjectionTokenKey) => {
      registryValues[dependencyInjectionTokens[dependencyInjectionTokenKey]] =
        Object.freeze(_dependencies[dependencyInjectionTokenKey]);
    }
  );

  return registryValues;
})();

registry.provideMany(_provisions);

const _application = new components.ApplicationComponent();

document.body.appendChild(_application);
