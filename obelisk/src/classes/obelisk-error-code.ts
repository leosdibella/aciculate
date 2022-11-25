import { ObeliskErrorCode } from '../enums';

export class ObeliskError extends Error {
  readonly #errorCode: ObeliskErrorCode;

  public get errorCode() {
    return this.#errorCode;
  }

  public constructor(errorCode: ObeliskErrorCode, message: string) {
    super(message);

    this.#errorCode = errorCode;
  }
}
