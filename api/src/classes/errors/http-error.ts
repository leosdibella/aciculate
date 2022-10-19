import { IHttpResponse } from '@interfaces';

export class HttpError<T = unknown> extends Error {
  public constructor(public value: IHttpResponse<T>) {
    super();
  }
}
