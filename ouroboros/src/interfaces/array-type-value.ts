import { TypeValue, ReferenceTypeValue } from '../types';
import { ValueType } from '../enums';

export interface IArrayTypeValue {
  readonly valueType: ValueType.array;
  readonly value: TypeValue[];
  readonly parent?: ReferenceTypeValue;
}
