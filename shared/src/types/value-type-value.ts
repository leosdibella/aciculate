import {
  IArrayValueType,
  IObjectValueType,
  IPrimitiveValueType
} from '../interfaces';

export type ValueTypeValue =
  | IPrimitiveValueType
  | IArrayValueType
  | IObjectValueType
  | Record<string, never>;
