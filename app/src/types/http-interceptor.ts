import { IHttpRequest, IHttpSimpleRequest } from '@interfaces';

export type HttpInterceptor = <
  T = unknown,
  S extends IHttpRequest<T> | IHttpSimpleRequest = IHttpSimpleRequest
>(
  httpRequest: S
) => S | Promise<S>;
