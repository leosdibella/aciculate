import { IBaseModel } from './base-model';

export interface IOrganizationUserRoleModel extends IBaseModel {
  readonly organizationId: string;
  readonly userId: string;
  readonly roleId: string;
}
