import { IOrganizationModel } from '../models';
import { IHttpResponse } from '../utilities';
import { IController } from './controller';

export interface IOrganizationController extends IController {
  get(id: string): Promise<IHttpResponse<IOrganizationModel>>;
}
