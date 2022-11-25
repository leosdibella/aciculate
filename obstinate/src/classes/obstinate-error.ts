import { ObstinateErrorCode } from '../enums';

export class ObstinateError extends Error {
  readonly #obstinateErrorCode: ObstinateErrorCode;

  public get obstinateErrorCode() {
    return this.#obstinateErrorCode;
  }

  public constructor(obstinateErrorCode: ObstinateErrorCode, message: string) {
    super(message);

    this.#obstinateErrorCode = obstinateErrorCode;
  }
}
