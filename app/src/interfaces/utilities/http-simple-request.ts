export interface IHttpSimpleRequest {
  url: string;
  queryStringParameters?: Record<string, string>;
  routeParameters?: Record<string, string>;
  headers?: Record<string, string>;
}
