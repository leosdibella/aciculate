import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { IAuthenticationService } from '@interfaces/services';
import { deferInject } from '@shared/decorators';

export class Login extends HTMLElement {
  @deferInject(dependencyInjectionTokens.authenticationService)
  private readonly _authenticationService: IAuthenticationService;

  public constructor() {
    super();
  }
}
