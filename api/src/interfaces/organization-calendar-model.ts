import { IBaseModel } from './base-model';

export interface IOrganizationCalendarModel extends IBaseModel {
  organizationId: string;
  calendarId: string;
}
