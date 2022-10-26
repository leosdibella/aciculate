import { ApiError } from '@shared/classes';
import { HttpStatusCode } from '@shared/enums';
import { IApiError } from '@shared/interfaces';

export class HttpError extends Error {
  readonly #apiError?: Readonly<ApiError>;
  readonly #httpStatusCode: HttpStatusCode;

  public get apiError() {
    return this.#apiError;
  }

  public get httpStatusCode() {
    return this.#httpStatusCode;
  }

  public constructor(httpStatusCode: HttpStatusCode, data: unknown) {
    super();
    this.#httpStatusCode = httpStatusCode;

    if (Array.isArray(data)) {
      const apiErrors: Readonly<IApiError>[] = [];

      for (let i = 0; i < data.length; ++i) {
        const error: IApiError = data[i];

        if (
          typeof error === 'object' &&
          error &&
          error.errorCode &&
          typeof error.message === 'string'
        ) {
          apiErrors.push(
            Object.freeze({
              errorCode: error.errorCode,
              message: error.message
            })
          );
        }
      }

      this.#apiError = new ApiError(apiErrors);
    }
  }
}
