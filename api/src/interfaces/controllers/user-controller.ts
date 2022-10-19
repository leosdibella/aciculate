import { ICreateUserRequest } from '../services';
import { IUserModel } from '../models';
import { IController } from './controller';
import { IHttpResponse } from '../utilities';

export interface IUserController extends IController {
  get(id: string): Promise<IHttpResponse<IUserModel>>;
  create(createRequest: ICreateUserRequest): Promise<IHttpResponse<IUserModel>>;
}
