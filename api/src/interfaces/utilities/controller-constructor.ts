import { IController } from './controller';
import { IRoute } from './route';

export interface IControllerConstructor<T, S, R> {
  new (): IController<T, S>;
  readonly routePrefix: string;
  readonly routes: Readonly<Record<keyof R, Readonly<IRoute>>>;
}
