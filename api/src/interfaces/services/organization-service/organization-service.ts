import { IOrganizationModel } from '@interfaces/models';

export interface IOrganizationService {
  selectSingle(id: string): Promise<IOrganizationModel>;
}
