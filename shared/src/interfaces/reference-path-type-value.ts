import { ReferenceTypeValue } from 'src/types';
import { ValueType } from '../enums';

export interface IReferencePathTypeValue {
  readonly valueType: ValueType.referencePath;
  readonly value: ReferenceTypeValue;
}
