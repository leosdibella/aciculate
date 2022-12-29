export interface IRouteState {
  readonly path: string;
  readonly state?: unknown;
  readonly routeParamters?: Readonly<Record<string, string>>;
  readonly queryStringParameters?: Readonly<Record<string, string>>;
}
