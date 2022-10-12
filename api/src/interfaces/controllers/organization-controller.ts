import { IController } from './controller';

export interface IOrganizationController extends IController {
  get(id: string): Promise<void>;
}
