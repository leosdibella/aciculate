import { IHttpResponse } from '@interfaces';

export type Endpoint<T = unknown> = (
  ...parameters: unknown[]
) => IHttpResponse | Promise<IHttpResponse<T>>;
