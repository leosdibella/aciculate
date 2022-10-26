import { IAuthenticationResponse } from '@shared/interfaces';

export interface IAuthenticationService {
  authenticate(
    username: string,
    password: string
  ): Promise<IAuthenticationResponse>;
}
