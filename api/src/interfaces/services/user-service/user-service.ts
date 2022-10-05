import { ICreateUserRequest } from './requests';
import { IUserModel } from '@interfaces/models';

export interface IUserService {
  get(id: string): Promise<IUserModel>;
  create(request: ICreateUserRequest): Promise<IUserModel>;
}
