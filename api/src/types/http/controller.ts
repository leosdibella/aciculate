import { ControllerName } from '@enums';
import {
  IOrganizationController,
  IUserController
} from '@interfaces/controllers';

export type Controller<T extends ControllerName> =
  T extends ControllerName.userController
    ? IUserController
    : T extends ControllerName.organizationController
    ? IOrganizationController
    : never;
