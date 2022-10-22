import { IHttpRequest, IHttpSimpleRequest } from '../utilities';

export interface IHttpService {
  get<T = unknown>(request: IHttpSimpleRequest): Promise<T>;
  put<S = unknown, T = unknown>(request: IHttpRequest<T>): Promise<S>;
  post<S = unknown, T = unknown>(request: IHttpRequest<T>): Promise<S>;
  patch<S = unknown, T = unknown>(request: IHttpRequest<T>): Promise<S>;
  delete<T = unknown>(request: IHttpSimpleRequest): Promise<T>;
}
