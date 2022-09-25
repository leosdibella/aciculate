import { DbTableName } from '../enums';
import {
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel
} from '../interfaces';

export type DbTable<T extends DbTableName> = T extends DbTableName.calendar
  ? ICalendarModel
  : T extends DbTableName.calendarEvent
  ? ICalendarEventModel
  : T extends DbTableName.organization
  ? IOrganizationModel
  : T extends DbTableName.user
  ? IUserModel
  : never;
