import { IController } from '@interfaces/controllers';

export type ControllerRoutes<T extends IController> = Exclude<
  Extract<keyof T, string>,
  keyof IController
>;
