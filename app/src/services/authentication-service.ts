import { HttpError } from '@classes/http-error';
import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { IAuthenticationService, IHttpService } from '@interfaces';
import { ApiError } from '@shared/classes';
import { inject } from '@shared/decorators';
import { Entity } from '@shared/enums';
import { IAuthenticationResponse } from '@shared/interfaces';

export class AuthenticationService implements IAuthenticationService {
  readonly #httpService: IHttpService;

  public async authenticate(username: string, password: string) {
    try {
      const response = await this.#httpService.post<IAuthenticationResponse>({
        url: Entity.user,
        body: {
          username,
          password
        }
      });

      return response;
    } catch (e: unknown) {
      if (e instanceof HttpError) {
        throw e.apiError;
      }

      // TODO
      throw new ApiError([]);
    }
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpService)
    httpService: IHttpService
  ) {
    this.#httpService = httpService;
  }
}
