import { IApiError } from '../interfaces';

export class ApiError extends Error {
  readonly #apiErrors: readonly Readonly<IApiError>[];

  public get errors() {
    return this.#apiErrors;
  }

  public merge(apiError: ApiError) {
    return new ApiError([...this.#apiErrors, ...apiError.errors]);
  }

  public constructor(_apiErrors: Readonly<IApiError>[]) {
    super(JSON.stringify(_apiErrors));

    this.#apiErrors = Object.freeze<IApiError[]>(
      _apiErrors.map((ae) => Object.freeze(ae))
    );
  }
}
