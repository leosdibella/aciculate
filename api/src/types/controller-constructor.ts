import { IController } from '@interfaces';
import { Constructor } from '@shared/types';

export type ControllerConstructor<T extends IController = IController> =
  Constructor<T>;
