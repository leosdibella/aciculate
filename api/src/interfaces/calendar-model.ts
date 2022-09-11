import { IBaseModel } from './base-model';
import { ICalendarEventModel } from './calendar-event-model';
import { IOrganizationModel } from './organization-model';
import { IUserModel } from './user-model';

export interface ICalendarModel extends IBaseModel {
  data: unknown | null;
  title: string;
  description: string | null;
  organizationId: string | null;
  userId: string | null;
  isPrivate: boolean;
  calendarEvents: ICalendarEventModel[] | null;
  organization: IOrganizationModel | null;
  user: IUserModel | null;
}
