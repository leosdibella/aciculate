import {
  IAuthenticationRequest,
  IAuthenticationResponse
} from '@shared/interfaces';
import { IHttpResponse } from '../utilities';
import { IController } from './controller';

export interface IAuthenticationController extends IController {
  authenticate(
    request: IAuthenticationRequest
  ): Promise<IHttpResponse<IAuthenticationResponse>>;
  revokeSystemTokens(reallowOn?: Date): Promise<IHttpResponse>;
  revokeOrganizationTokens(
    organizationId: string,
    reallowOn?: Date
  ): Promise<IHttpResponse>;
  revokeUserTokens(userId: string, reallowOn?: Date): Promise<IHttpResponse>;
}
