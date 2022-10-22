import { IOrganizationModel } from '../models';
import { IHttpResponse } from '../utilities';
import { IController } from './controller';

export interface IOrganizationController extends IController {
  selectSingle(id: string): Promise<IHttpResponse<IOrganizationModel>>;
}
