const routes = Symbol('routes');
const routePrefix = Symbol('routePrefix');
const route = Symbol('route');
const requestBody = Symbol('requestBody');
const routeParameter = Symbol('routeParameter');
const queryStringParameter = Symbol('queryStringParameter');

export const httpMetadataKeys = Object.freeze({
  route,
  routes,
  routePrefix,
  requestBody,
  routeParameter,
  queryStringParameter
});
