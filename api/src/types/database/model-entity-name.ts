import { EntityName } from '@enums';
import {
  IBaseModel,
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel,
  IRoleModel,
  IOrganizationCalendarModel,
  IOrganizationUserRoleModel,
  IUserPasswordModel,
  ISystemModel
} from '@interfaces';

export type ModelEntityName<T extends IBaseModel> = T extends IUserModel
  ? EntityName.user
  : T extends IOrganizationModel
  ? EntityName.organization
  : T extends IRoleModel
  ? EntityName.role
  : T extends ICalendarModel
  ? EntityName.calendar
  : T extends ICalendarEventModel
  ? EntityName.calendarEvent
  : T extends IOrganizationCalendarModel
  ? EntityName.organizationCalendar
  : T extends IOrganizationUserRoleModel
  ? EntityName.organizationUserRole
  : T extends IUserPasswordModel
  ? EntityName.userPassword
  : T extends ISystemModel
  ? EntityName.system
  : never;
