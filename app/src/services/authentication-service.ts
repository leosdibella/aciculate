import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { IAuthenticationService, IHttpService } from '@interfaces';
import { inject } from '@shared/decorators';
import { Entity } from '@shared/enums';

export class AuthenticationService implements IAuthenticationService {
  readonly #httpService: IHttpService;

  public authenticate(username: string, password: string) {
    const response = this.#httpService.post({
      url: Entity.user,
      body: {
        username,
        password
      }
    });
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpService)
    httpService: IHttpService
  ) {
    this.#httpService = httpService;
  }
}
