import { HttpError } from '@classes/http-error';
import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { IHttpRequest, IHttpService, IHttpSimpleRequest } from '@interfaces';
import { ApiError } from '@shared/classes';
import { inject } from '@obelisk/decorators';
import { ApiErrorCode, HttpStatusCode, HttpVerb } from '@shared/enums';
import { HttpInterceptor } from '@types';

export class HttpService implements IHttpService {
  static readonly #baseUrl = `${ACICULATE_API_ORIGIN}`;

  static #buildUrl(
    url: string,
    routeParameters: Record<string, string>,
    queryStringParameters: Record<string, string>
  ) {
    const queryString = Object.keys(queryStringParameters)
      .map((qsp) => queryStringParameters[qsp])
      .join('&');

    const routeReplacedUrl = url
      .split('/')
      .map((rp) => (rp && rp[0] === ':' ? routeParameters[rp.slice(1)] : rp))
      .join('/');

    return `${HttpService.#baseUrl}/${routeReplacedUrl}/${
      queryString ? '?' : ''
    }${queryString}`;
  }

  readonly #httpInterceptors: HttpInterceptor[];

  async #intercept<T>(httpRequest: IHttpRequest<T>) {
    let request = httpRequest;

    for (let i = 0; i < this.#httpInterceptors.length; ++i) {
      const interceptor = this.#httpInterceptors[i];

      request = (
        interceptor.constructor.name === 'AsyncFunction'
          ? await interceptor(request)
          : interceptor(request)
      ) as IHttpRequest<T>;
    }

    return request;
  }

  async #fetch<T, S = unknown>(
    httpRqeust: IHttpRequest<T>,
    httpVerb: HttpVerb
  ): Promise<S> {
    const { url, routeParameters, queryStringParameters, body, headers } =
      await this.#intercept(httpRqeust);

    const fullUrl = HttpService.#buildUrl(
      url,
      routeParameters ?? {},
      queryStringParameters ?? {}
    );

    const response = await fetch(fullUrl, {
      method: httpVerb,
      mode: 'cors',
      credentials: 'include',
      headers,
      body: JSON.stringify(body)
    });

    try {
      const data = (await response.json()) as S;

      if (response.status !== HttpStatusCode.success) {
        throw new HttpError(response.status, data);
      }

      return data;
    } catch (e: unknown) {
      if (e instanceof HttpError) {
        throw e;
      } else {
        throw new ApiError([
          {
            errorCode: ApiErrorCode.unexpectedHttpFailure,
            message: `${e}`
          }
        ]);
      }
    }
  }

  public async get<T>(request: IHttpSimpleRequest) {
    return this.#fetch<unknown, T>(request, HttpVerb.get);
  }

  public async put<S, T>(request: IHttpRequest<T>) {
    return this.#fetch<T, S>(request, HttpVerb.put);
  }

  public async post<S, T>(request: IHttpRequest<T>) {
    return this.#fetch<T, S>(request, HttpVerb.post);
  }

  public async patch<S, T>(request: IHttpRequest<T>) {
    return this.#fetch<T, S>(request, HttpVerb.patch);
  }

  public async delete<T>(request: IHttpSimpleRequest) {
    return this.#fetch<unknown, T>(request, HttpVerb.delete);
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpInterceptors)
    httpInterceptors: HttpInterceptor[]
  ) {
    this.#httpInterceptors = httpInterceptors;
  }
}
