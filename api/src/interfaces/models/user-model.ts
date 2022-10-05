import { IBaseModel } from './base-model';
import { ICalendarModel } from './calendar-model';
import { IOrganizationModel } from './organization-model';

export interface IUserModel extends IBaseModel {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly passwordSalt: string;
  readonly organizations: Readonly<Readonly<IOrganizationModel[]>> | null;
  readonly calendars: Readonly<Readonly<ICalendarModel>[]> | null;
}
