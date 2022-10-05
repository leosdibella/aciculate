import { DbTableName } from '@enums';
import {
  IBaseModel,
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel,
  IRoleModel,
  IOrganizationCalendarModel,
  IOrganizationUserRoleModel
} from '@interfaces';

export type DbTable<T extends IBaseModel> = T extends IUserModel
  ? DbTableName.user
  : T extends IOrganizationModel
  ? DbTableName.organization
  : T extends IRoleModel
  ? DbTableName.role
  : T extends ICalendarModel
  ? DbTableName.calendar
  : T extends ICalendarEventModel
  ? DbTableName.calendarEvent
  : T extends IOrganizationCalendarModel
  ? DbTableName.organizationCalendar
  : T extends IOrganizationUserRoleModel
  ? DbTableName.organizationUserRole
  : never;