import { Constructor } from '../types';
import { IInjection } from './injection';

export interface IDependency<T = unknown> {
  token: symbol;
  constructor: Constructor<T>;
  injections: IInjection[];
}
