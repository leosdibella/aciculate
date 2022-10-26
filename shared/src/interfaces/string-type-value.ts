import { ValueType } from '../enums';

export interface IStringTypeValue {
  readonly valueType: ValueType.string;
  readonly value: string;
}
