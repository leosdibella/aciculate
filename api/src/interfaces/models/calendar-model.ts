import { IBaseModel } from './base-model';
import { ICalendarEventModel } from './calendar-event-model';
import { IOrganizationModel } from './organization-model';
import { IUserModel } from './user-model';

export interface ICalendarModel extends IBaseModel {
  readonly data: Readonly<Record<string, unknown>> | null;
  readonly title: string;
  readonly description: string | null;
  readonly organizationId: string | null;
  readonly userId: string | null;
  readonly isPrivate: boolean;
  readonly calendarEvents: Readonly<Readonly<ICalendarEventModel[]>>;
  readonly organization: Readonly<IOrganizationModel> | null;
  readonly user: Readonly<IUserModel> | null;
}
