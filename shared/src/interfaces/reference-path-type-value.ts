import { ReferenceTypeValue } from '../types';
import { ValueType } from '../enums';

export interface IReferencePathTypeValue {
  readonly valueType: ValueType.referencePath;
  readonly value: ReferenceTypeValue;
}
