import { OuroborosErrorCode, OuroborosMethod } from '../enums';
import { ICharacterLocation } from '../interfaces';

export class OuroborosError extends Error {
  static #formatErrorMessage(
    message: string,
    method: OuroborosMethod,
    errorCode: OuroborosErrorCode,
    characterLocation: ICharacterLocation
  ): string {
    const locationInformation =
      method === OuroborosMethod.deserialize
        ? ` - line number: ${characterLocation.line}, space count ${characterLocation.space}, tab count: ${characterLocation.tab}`
        : '';

    return `Obelisk ${method} error - ${message} - code: ${errorCode}${locationInformation}`;
  }

  readonly #errorCode: OuroborosErrorCode;
  readonly #characterLocation: ICharacterLocation;

  public get errorCode() {
    return this.#errorCode;
  }

  public get characterLocation() {
    return this.#characterLocation;
  }

  public constructor(
    message: string,
    method: OuroborosMethod,
    errorCode: OuroborosErrorCode,
    characterLocation = Object.freeze<ICharacterLocation>({
      tab: 0,
      line: 0,
      space: 0
    })
  ) {
    super(
      OuroborosError.#formatErrorMessage(
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
