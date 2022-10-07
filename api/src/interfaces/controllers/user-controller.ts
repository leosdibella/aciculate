import { ICreateUserRequest } from '..';
import { IController } from './controller';

export interface IUserController extends IController {
  get(id: string): Promise<void>;
  create(createRequest: ICreateUserRequest): Promise<void>;
}
