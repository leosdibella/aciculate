import { IHttpContext, IUserContext } from '../contexts';

export interface IController {
  readonly userContext: Readonly<IUserContext> | undefined | null;
  readonly httpContext: Readonly<IHttpContext>;
}
