import { ValueType } from '../enums';

export interface IDateTypeValue {
  readonly valueType: ValueType.date;
  readonly value: Date;
}
