import { ValueType } from '../enums';

export type ReferencePathPiece =
  | { type: ValueType.array; value: number }
  | { type: ValueType.object; value: string };
