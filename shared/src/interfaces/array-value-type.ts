import { ValueTypeValue } from '../types';
import { ValueType } from '../enums';

export interface IArrayValueType {
  valueType: ValueType.array;
  value: ValueTypeValue[];
}
