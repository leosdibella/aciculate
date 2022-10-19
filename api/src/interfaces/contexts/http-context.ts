import { IncomingHttpHeaders } from 'http';
import { IHttpResponse } from '../utilities';
import { Headers } from '@types';

export interface IHttpContext {
  readonly requestHeaders: IncomingHttpHeaders;
  readonly responseHeaders: Headers;
  sendResponse(httpResponse: IHttpResponse): void;
}
