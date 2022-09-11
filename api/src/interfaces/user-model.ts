import { IBaseModel } from './base-model';
import { ICalendarModel } from './calendar-model';
import { IOrganizationModel } from './organization-model';

export interface IUserModel extends IBaseModel {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  organizations: IOrganizationModel[] | null;
  calendars: ICalendarModel[] | null;
}
