import { ReferenceTypeValue } from '../types';
import { ValueType } from '../enums';
import { IMemberType } from './member-type';

export interface IObjectTypeValue {
  readonly valueType: ValueType.object;
  readonly value: IMemberType[];
  readonly parent?: ReferenceTypeValue;
}
