import { EntityName } from '@enums';
import {
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel,
  IRoleModel,
  IOrganizationCalendarModel,
  IOrganizationUserRoleModel
} from '@interfaces';

export type EntityNameModel<T extends EntityName> =
  T extends EntityName.calendar
    ? ICalendarModel
    : T extends EntityName.calendarEvent
    ? ICalendarEventModel
    : T extends EntityName.organization
    ? IOrganizationModel
    : T extends EntityName.user
    ? IUserModel
    : T extends EntityName.role
    ? IRoleModel
    : T extends EntityName.organizationCalendar
    ? IOrganizationCalendarModel
    : T extends EntityName.organizationUserRole
    ? IOrganizationUserRoleModel
    : never;
