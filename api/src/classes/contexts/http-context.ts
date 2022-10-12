import { IHttpContext } from '@interfaces';
import { Request, Response } from 'express';

export class HttpContext implements IHttpContext {
  readonly #request: Request;
  readonly #response: Response;

  public constructor(request: Request, response: Response) {
    this.#request = request;
    this.#response = response;
  }
}
