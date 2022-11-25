import { PrimitiveTypeValue } from './primitive-type-value';
import { ReferenceTypeValue } from './reference-type-value';

export type TypeValue =
  | ReferenceTypeValue
  | PrimitiveTypeValue
  | Record<string, never>;
