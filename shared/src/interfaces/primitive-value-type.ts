import { ValueType } from '../enums';

export interface IPrimitiveValueType {
  valueType: Exclude<ValueType, ValueType.array | ValueType.object>;
  value: string;
}
