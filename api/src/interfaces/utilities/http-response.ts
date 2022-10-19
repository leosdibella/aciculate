import { HttpStatusCode } from '@shared/enums';

export interface IHttpResponse<T = unknown> {
  readonly response?: T;
  readonly httpStatusCode: HttpStatusCode;
  readonly headers?: Readonly<
    Record<string, string | number | readonly string[]>
  >;
}
