import { DbTableName } from '@enums';
import {
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel,
  IRoleModel,
  IOrganizationCalendarModel,
  IOrganizationUserRoleModel
} from '@interfaces';

export type DbModel<T extends DbTableName> = T extends DbTableName.calendar
  ? ICalendarModel
  : T extends DbTableName.calendarEvent
  ? ICalendarEventModel
  : T extends DbTableName.organization
  ? IOrganizationModel
  : T extends DbTableName.user
  ? IUserModel
  : T extends DbTableName.role
  ? IRoleModel
  : T extends DbTableName.organizationCalendar
  ? IOrganizationCalendarModel
  : T extends DbTableName.organizationUserRole
  ? IOrganizationUserRoleModel
  : never;
