export interface IHttpRequest<T = unknown> {
  url: string;
  body?: T;
  queryStringParameters?: Record<string, string>;
  routeParameters?: Record<string, string>;
  headers?: Record<string, string>;
}
