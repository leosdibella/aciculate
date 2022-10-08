import { HttpVerb } from '@shared/enums';

export interface IRouteMetdata {
  readonly httpVerb: HttpVerb;
  readonly path: string;
}
