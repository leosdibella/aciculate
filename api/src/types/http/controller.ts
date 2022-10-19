import { ControllerName } from '@enums';
import {
  ICalendarController,
  ICalendarEventController,
  IOrganizationController,
  IUserController
} from '@interfaces/controllers';

export type Controller<T extends ControllerName> =
  T extends ControllerName.userController
    ? IUserController
    : T extends ControllerName.organizationController
    ? IOrganizationController
    : T extends ControllerName.calendarController
    ? ICalendarController
    : T extends ControllerName.calendarEventController
    ? ICalendarEventController
    : never;
