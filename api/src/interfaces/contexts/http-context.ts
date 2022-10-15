import { HttpStatusCode } from '@shared/enums';
import { IncomingHttpHeaders } from 'http';

export interface IHttpContext {
  readonly requestHeaders: IncomingHttpHeaders;
  sendResponse(response: unknown, statusCode?: HttpStatusCode): void;
  sendError(
    statusCode: Exclude<HttpStatusCode, HttpStatusCode.success>,
    response?: unknown
  ): void;
}
