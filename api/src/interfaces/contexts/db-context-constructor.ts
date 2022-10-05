import { IDbContext } from './db-context';
import { IUserContext } from './user-context';

export interface IDbContextConstructor {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  new (userContext?: IUserContext): IDbContext;
}
