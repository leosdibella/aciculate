import { ApiErrorCode } from '../enums';

export interface IApiError {
  readonly errorCode: ApiErrorCode;
  readonly message: string;
}
