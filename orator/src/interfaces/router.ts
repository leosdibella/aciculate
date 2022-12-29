import { IRouteState } from './route-state';

export interface IRouter {
  redirect(
    path: string,
    state?: unknown,
    routeParamters?: Record<string, unknown>,
    queryStringParameters?: Record<string, unknown>
  ): void;
  addRedirectListener(
    handler: (newState: IRouteState, oldState?: IRouteState) => void
  ): void;
  removeRedirectListener(
    handler: (newState: IRouteState, oldState?: IRouteState) => void
  ): void;
  get routeParamters(): Readonly<Record<string, string>>;
  get queryStringParameters(): Readonly<Record<string, string>>;
}
