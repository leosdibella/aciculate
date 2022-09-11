import { IBaseModel } from './base-model';

export interface IOrganizationUserEntity extends IBaseModel {
  organizationId: string;
  userId: string;
}
