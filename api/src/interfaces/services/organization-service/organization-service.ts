import { IOrganizationModel } from '@interfaces/models';

export interface IOrganizationService {
  get(id: string): Promise<IOrganizationModel>;
}
