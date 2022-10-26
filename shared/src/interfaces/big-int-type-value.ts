import { ValueType } from '../enums';

export interface IBigIntTypeValue {
  readonly valueType: ValueType.bigint;
  readonly value: bigint;
}
