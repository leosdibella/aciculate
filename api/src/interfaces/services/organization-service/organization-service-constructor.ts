import { IUserContext } from '@interfaces/contexts';
import { IOrganizationService } from './organization-service';

export interface IOrganizationServiceConstructor {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  new (userContext: IUserContext): IOrganizationService;
}
