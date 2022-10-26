import { ValueType } from '../enums';

export interface INullTypeValue {
  readonly valueType: ValueType.null;
  readonly value: null;
}
