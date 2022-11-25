import { ValueType } from '../enums';

export interface IBooleanTypeValue {
  readonly valueType: ValueType.boolean;
  readonly value: boolean;
}
