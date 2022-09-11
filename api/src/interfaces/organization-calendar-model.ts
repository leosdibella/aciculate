import { IBaseModel } from './base-model';

export interface IOrganizationCalendar extends IBaseModel {
  organizationId: string;
  calendarId: string;
}
