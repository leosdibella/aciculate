import { IResolvedRoute, IRoute, IRouter, IRouteState } from '../interfaces';

export class Router implements IRouter {
  #previousState: IRouteState | undefined = undefined;
  #queryStringParameters: Readonly<Record<string, string>> = Object.freeze({});
  #routeParamters: Readonly<Record<string, string>> = Object.freeze({});
  readonly #resolvedRoutes: Readonly<IResolvedRoute>;

  readonly #listeners: ((
    newState: IRouteState,
    oldState?: IRouteState
  ) => void)[] = [];

  static #serializeParameters(parameters: Record<string, unknown>) {
    const serializedParameters: Record<string, string> = {};

    Object.keys(parameters).forEach((parameter) => {
      serializedParameters[parameter] = String(parameters[parameter]);
    });

    return Object.freeze(serializedParameters);
  }

  static #encodeParameters(parameters: Record<string, string>) {
    const uriEncodedParameters: Record<string, string> = {};

    Object.keys(parameters).forEach((parameter) => {
      uriEncodedParameters[parameter] = encodeURIComponent(
        parameters[parameter]
      );
    });

    return Object.freeze(uriEncodedParameters);
  }

  #resolveRoute() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    this.#queryStringParameters = Object.fromEntries(urlSearchParams.entries());
  }

  public get queryStringParameters() {
    return this.#queryStringParameters;
  }

  public get routeParamters() {
    return this.#routeParamters;
  }

  public addRedirectListener(
    handler: (newState: IRouteState, oldState?: IRouteState) => void
  ) {
    if (this.#listeners.indexOf(handler) > -1) {
      return;
    }

    this.#listeners.push(handler);
  }

  public removeRedirectListener(
    handler: (newState: IRouteState, oldState?: IRouteState) => void
  ) {
    const index = this.#listeners.indexOf(handler);

    if (index === -1) {
      return;
    }

    this.#listeners.splice(index, 1);
  }

  #resolveUrl(path: string) {
    const encodedRouteParameters = Router.#encodeParameters(
      this.#routeParamters
    );

    const encodedQueryStringParameters = Router.#encodeParameters(
      this.#queryStringParameters
    );

    const resolvedPath = path
      .split('/')
      .map((pathPiece) => {
        const sanitizedPathPiece =
          pathPiece.indexOf(':') === 0 ? pathPiece.substring(1) : undefined;

        const resolvedPathPiece = sanitizedPathPiece
          ? encodedRouteParameters[sanitizedPathPiece]
          : pathPiece;

        return resolvedPathPiece ?? pathPiece;
      })
      .join('/');

    const queryString = Object.keys(encodedQueryStringParameters)
      .map(
        (encodedQueryStringParameter) =>
          `${encodedQueryStringParameter}=${encodedQueryStringParameters[encodedQueryStringParameter]}`
      )
      .join('&');

    return `${resolvedPath}${queryString.length ? '?' : ''}${queryString}`;
  }

  public redirect(
    path: string,
    state: unknown = {},
    routeParamters: Record<string, unknown> = {},
    queryStringParameters: Record<string, unknown> = {}
  ): void {
    this.#routeParamters = Router.#serializeParameters(routeParamters);

    this.#queryStringParameters = Router.#serializeParameters(
      queryStringParameters
    );

    const newState: IRouteState = {
      path,
      state,
      routeParamters: this.#routeParamters,
      queryStringParameters: this.#queryStringParameters
    };

    const url = this.#resolveUrl(path);

    window.history.pushState(state, '', url);

    this.#listeners.forEach((listener) => {
      listener(newState, this.#previousState);
    });

    this.#previousState = newState;
  }

  public constructor(routes: IRoute[]) {
    const resolvedRoutes: IResolvedRoute = {};

    if (routes.length) {
      const stack: IRoute[] = [...routes];

      while (stack.length) {

      }
    }

    this.#resolvedRoutes = Object.freeze(resolvedRoutes);
  }
}
