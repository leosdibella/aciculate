import { IRoleModel } from 'src/interfaces/role-model';
import { DbTableName } from '../enums';
import {
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel
} from '../interfaces';

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
  : never;
