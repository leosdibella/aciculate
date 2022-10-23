import { ValueType } from '../enums';
import { IMemberType } from './member-type';

export interface IObjectValueType {
  valueType: ValueType.object;
  value: IMemberType[];
}
