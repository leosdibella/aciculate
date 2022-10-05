import * as core from 'express-serve-static-core';

export interface IHttpContext {
  use(routePrefix: string, router: core.Router): void;
}
