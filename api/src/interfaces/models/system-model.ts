import { IBaseModel } from './base-model';

export interface ISystemModel extends IBaseModel {
  readonly signature: Date;
}
