import { ICreateUserRequest } from './requests';
import { IUserModel } from '@interfaces/models';

export interface IUserService {
  selectSingle(id: string): Promise<IUserModel>;
  insertSingle(request: ICreateUserRequest): Promise<IUserModel>;
}
