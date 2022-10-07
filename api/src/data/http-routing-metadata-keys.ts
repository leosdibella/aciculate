const routes = Symbol('routes');
const routePrefix = Symbol('routePrefix');
const routePath = Symbol('routePath');
const httpVerb = Symbol('httpVerb');
const requestBody = Symbol('requestBody');
const requestBodyValidator = Symbol('requestBodyValidator');
const routeParameter = Symbol('routeParameter');
const routeParameterValueCoercer = Symbol('routeParameterValueCoercer');
const queryStringParameter = Symbol('queryStringParameter');
const queryStringValueCoercer = Symbol('queryStringValueCoercer');

export const httpRoutingMetadataKeys = Object.freeze({
  routes,
  httpVerb,
  routePath,
  routePrefix,
  requestBody,
  requestBodyValidator,
  routeParameter,
  routeParameterValueCoercer,
  queryStringParameter,
  queryStringValueCoercer
});
