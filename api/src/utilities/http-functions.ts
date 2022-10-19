import { Headers } from '@types';
import { HttpStatusCode } from '@shared/enums';
import { IHttpResponse } from '@interfaces';
import { HttpError } from '@classes/errors';

function _httpResponse<T>(
  httpStatusCode: HttpStatusCode,
  response?: T,
  headers?: Headers
): IHttpResponse<T> {
  return {
    httpStatusCode,
    response,
    headers
  };
}

function _httpError<T>(httpResponse: IHttpResponse<T>) {
  return new HttpError(httpResponse);
}

export function ok<T>(response?: T, headers?: Headers) {
  return _httpResponse(HttpStatusCode.success, response, headers);
}

export function badRequest<T>(response?: T, headers?: Headers) {
  return _httpError(
    _httpResponse(HttpStatusCode.badRequest, response, headers)
  );
}

export function notFound<T>(response?: T, headers?: Headers) {
  return _httpError(_httpResponse(HttpStatusCode.notFound, response, headers));
}

export function forbidden<T>(response?: T, headers?: Headers) {
  return _httpError(_httpResponse(HttpStatusCode.forbidden, response, headers));
}

export function unauthorized<T>(response?: T, headers?: Headers) {
  return _httpError(
    _httpResponse(HttpStatusCode.unauthorized, response, headers)
  );
}

export function internalServerError<T>(response?: T, headers?: Headers) {
  return _httpError(
    _httpResponse(HttpStatusCode.internalServerError, response, headers)
  );
}
