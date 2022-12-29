export interface IResolvedRoute {
  readonly [pathPart: string]: HTMLElement | IResolvedRoute;
}
