import { IAuthenticationResponse } from '@shared/interfaces';

export interface IAuthenticationService {
  authenticate(
    username: string,
    password: string
  ): Promise<IAuthenticationResponse>;
  revokeSystemTokens(reallowOn: Date): Promise<void>;
  revokeOrganizationTokens(
    organizationId: string,
    reallowOn: Date
  ): Promise<void>;
  revokeUserTokens(userId: string, reallowOn: Date): Promise<void>;
}
