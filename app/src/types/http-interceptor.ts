import { IHttpRequest } from '@interfaces';

export type HttpInterceptor = <T = unknown>(
  httpRequest: IHttpRequest<T>
) => IHttpRequest<T> | Promise<IHttpRequest<T>>;
