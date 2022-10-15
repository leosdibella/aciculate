import { IHttpContext } from '@interfaces';
import { HttpStatusCode } from '@shared/enums';
import { Request, Response } from 'express';

export class HttpContext implements IHttpContext {
  readonly #request: Request;
  readonly #response: Response;

  public get requestHeaders() {
    return this.#request.headers;
  }

  public sendResponse(
    response: unknown,
    statusCode: HttpStatusCode = HttpStatusCode.success
  ) {
    this.#response.status(statusCode).send(response);
  }

  public sendError(
    statusCode: Exclude<HttpStatusCode, HttpStatusCode.success>,
    response: unknown
  ) {
    this.#response.status(statusCode).send(response);
  }

  public constructor(request: Request, response: Response) {
    this.#request = request;
    this.#response = response;
  }
}
