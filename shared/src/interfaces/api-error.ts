import { ApiErrorCode } from '../enums';

export interface IApiError {
  errorCode: ApiErrorCode;
  message: string;
}
