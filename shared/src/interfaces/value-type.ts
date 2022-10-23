import { ValueType } from '../enums';

export interface IValueType<T = unknown> {
  valueType: ValueType | undefined;
  value: T | undefined;
}
