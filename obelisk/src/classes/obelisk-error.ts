import { ObeliskErrorCode, ObeliskMethod } from '../enums';
import { ICharacterLocation } from '../interfaces';

export class ObeliskError extends Error {
  static #formatErrorMessage(
    message: string,
    method: ObeliskMethod,
    errorCode: ObeliskErrorCode,
    characterLocation: ICharacterLocation
  ): string {
    const locationInformation =
      method === ObeliskMethod.deserialize
        ? ` - line number: ${characterLocation.line}, space count ${characterLocation.space}, tab count: ${characterLocation.tab}`
        : '';

    return `Obelisk ${method} error - ${message} - code: ${errorCode}${locationInformation}`;
  }

  readonly #errorCode: ObeliskErrorCode;
  readonly #characterLocation: ICharacterLocation;

  public get errorCode() {
    return this.#errorCode;
  }

  public get characterLocation() {
    return this.#characterLocation;
  }

  public constructor(
    message: string,
    method: ObeliskMethod,
    errorCode: ObeliskErrorCode,
    characterLocation = Object.freeze<ICharacterLocation>({
      tab: 0,
      line: 0,
      space: 0
    })
  ) {
    super(
      ObeliskError.#formatErrorMessage(
        message,
        method,
        errorCode,
        characterLocation
      )
    );

    this.#errorCode = errorCode;
    this.#characterLocation = characterLocation;
  }
}
