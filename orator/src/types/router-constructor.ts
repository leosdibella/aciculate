import { IRoute } from '../interfaces/route';
import { IRouter } from '../interfaces/router';

export type RouterConstructor = (routes: IRoute[]) => IRouter;
