import { IBaseModel } from './base-model';

export interface IOrganizationCalendarModel extends IBaseModel {
  readonly organizationId: string;
  readonly calendarId: string;
}
