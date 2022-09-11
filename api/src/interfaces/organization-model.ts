import { IBaseModel } from './base-model';
import { IUserModel } from './user-model';

export interface IOrganizationModel extends IBaseModel {
  name: string;
  description: string | null;
  users: IUserModel[] | null;
}
