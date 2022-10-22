import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { IAuthenticationService, IHttpService } from '@interfaces';
import { inject } from '@shared/decorators';

export class AuthenticationService implements IAuthenticationService {
  readonly #httpService: IHttpService;

  public authenticate(username: string, password: string) {

  }

  public constructor(
    @inject(dependencyInjectionTokens.httpService)
    httpService: IHttpService
  ) {
    this.#httpService = httpService;
  }
}
