import { Role } from '@shared/enums';
import { IBaseModel } from './base-model';

export interface IRoleModel extends IBaseModel {
  readonly role: Role;
}
