import { IBaseModel } from './base-model';

export interface IUserPasswordModel extends IBaseModel {
  readonly userId: string;
  readonly salt: string;
  readonly hash: string;
  readonly lastLoginDate: Date;
  readonly tokenSecret: string;
}
