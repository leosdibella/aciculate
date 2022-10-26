import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { IAuthenticationService } from '@interfaces/services';
import { deferInject } from '@shared/decorators';

export class Login extends HTMLElement {
  async #authenticate(username: string, password: string) {
    try {
      const response = await this._authenticationService.authenticate(
        username,
        password
      );

      // redirect
    } catch (e: unknown) {

    }
  }

  @deferInject(dependencyInjectionTokens.authenticationService)
  private readonly _authenticationService!: IAuthenticationService;

  public constructor() {
    super();
  }
}
