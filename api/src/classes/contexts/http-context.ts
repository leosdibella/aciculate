import { IHttpContext, IHttpResponse } from '@interfaces';
import { Request, Response } from 'express';
import { Headers } from '@types';
import { dependencyInjectionTokens } from '@data/dependency-injection-tokens';
import { inject } from '@shared/decorators';

export class HttpContext implements IHttpContext {
  readonly #request: Request;
  readonly #response: Response;

  public readonly responseHeaders: Headers = {};

  public get requestHeaders() {
    return this.#request.headers;
  }

  public sendResponse<T>(httpResponse: IHttpResponse<T>) {
    const responseHeaders = Object.keys(this.responseHeaders);

    if (responseHeaders.length) {
      responseHeaders.forEach((headerName) => {
        this.#response.setHeader(headerName, this.responseHeaders[headerName]);
      });
    }

    if (httpResponse.headers) {
      Object.keys(httpResponse.headers).forEach((headerName) => {
        this.#response.setHeader(headerName, httpResponse.headers![headerName]);
      });
    }

    this.#response
      .status(httpResponse.httpStatusCode)
      .send(httpResponse.response);
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpRequest)
    request: Request,
    @inject(dependencyInjectionTokens.httpResponse)
    response: Response
  ) {
    this.#request = request;
    this.#response = response;
  }
}
