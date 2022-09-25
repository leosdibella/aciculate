import { ICreateUserRequest } from './create-user-request';
import { IUserModel } from './user-model';

export interface IUserService {
  get(id: string): Promise<IUserModel>;
  create(request: ICreateUserRequest): Promise<IUserModel>;
}
