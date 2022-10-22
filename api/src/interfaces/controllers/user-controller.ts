import { ICreateUserRequest } from '../services';
import { IUserModel } from '../models';
import { IController } from './controller';
import { IHttpResponse } from '../utilities';

export interface IUserController extends IController {
  selectSingle(id: string): Promise<IHttpResponse<IUserModel>>;
  insertSingle(
    createRequest: ICreateUserRequest
  ): Promise<IHttpResponse<IUserModel>>;
}
