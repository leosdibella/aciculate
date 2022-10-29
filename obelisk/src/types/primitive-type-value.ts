import {
  IBigIntTypeValue,
  IBooleanTypeValue,
  IDateTypeValue,
  INullTypeValue,
  INumberTypeValue,
  IReferencePathTypeValue,
  IStringTypeValue,
  IUndefinedTypeValue
} from '../interfaces';

export type PrimitiveTypeValue =
  | IBigIntTypeValue
  | IBooleanTypeValue
  | IDateTypeValue
  | INullTypeValue
  | INumberTypeValue
  | IReferencePathTypeValue
  | IStringTypeValue
  | IUndefinedTypeValue;
