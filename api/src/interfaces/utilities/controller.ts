import { IUserContext } from '../contexts';

export interface IController<T, S> {
  readonly routePrefix: string;
  readonly request: T;
  readonly response: S;
  readonly userContext: IUserContext;
}
