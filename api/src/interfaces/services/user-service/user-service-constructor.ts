import { IUserContext } from '@interfaces/contexts';
import { IUserService } from './user-service';

export interface IUserServiceConstructor {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  new (userContext: IUserContext): IUserService;
}
