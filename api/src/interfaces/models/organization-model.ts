import { IBaseModel } from './base-model';
import { IUserModel } from './user-model';

export interface IOrganizationModel extends IBaseModel {
  readonly title: string;
  readonly data: Readonly<Record<string, unknown>> | null;
  readonly description: string | null;
  readonly users: Readonly<Readonly<IUserModel>[]>;
  readonly signature: Date;
}
