import { IBaseModel } from './base-model';

export interface IUserPasswordModel extends IBaseModel {
  readonly userId: string;
  readonly passwordHash: string;
  readonly passwordSalt: string;
  readonly lastLoginDate: Date;
  readonly signature: string;
}
