import { AjsonErrorCode, AjsonMethod } from '../enums';
import { ICharacterLocation } from '../interfaces';

export class AjsonError extends Error {
  static #formatErrorMessage(
    message: string,
    method: AjsonMethod,
    errorCode: AjsonErrorCode,
    characterLocation: ICharacterLocation
  ): string {
    const locationInformation =
      method === AjsonMethod.deserialize
        ? ` - line number: ${characterLocation.line}, space count ${characterLocation.space}, tab count: ${characterLocation.tab}`
        : '';

    return `AJSON ${method} error - ${message} - code: ${errorCode}${locationInformation}`;
  }

  readonly #errorCode: AjsonErrorCode;
  readonly #characterLocation: ICharacterLocation;

  public get errorCode() {
    return this.#errorCode;
  }

  public get characterLocation() {
    return this.#characterLocation;
  }

  public constructor(
    message: string,
    method: AjsonMethod,
    errorCode: AjsonErrorCode,
    characterLocation = Object.freeze<ICharacterLocation>({
      tab: 0,
      line: 0,
      space: 0
    })
  ) {
    super(
      AjsonError.#formatErrorMessage(
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
