import { IValueType } from './value-type';

export interface IMemberType<T = unknown> {
  name: string;
  value: IValueType<T>;
}
