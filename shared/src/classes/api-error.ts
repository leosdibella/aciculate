import { IApiError } from '../interfaces';

export class ApiError extends Error {
  private readonly _apiErrors: readonly Readonly<IApiError>[];

  public get errors() {
    return this._apiErrors;
  }

  public merge(apiError: ApiError) {
    return new ApiError([...this._apiErrors, ...apiError.errors]);
  }

  public constructor(_apiErrors: Readonly<IApiError>[]) {
    super(JSON.stringify(_apiErrors));

    this._apiErrors = Object.freeze(_apiErrors.map((ae) => Object.freeze(ae)));
  }
}
