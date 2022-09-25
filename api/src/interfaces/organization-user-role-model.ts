import { IBaseModel } from './base-model';

export interface IOrganizationUserRoleModel extends IBaseModel {
  organizationId: string;
  userId: string;
  roleId: string;
}
