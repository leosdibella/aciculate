import { PrimitiveType } from '../enums';

export type PrimitiveTypeValueType<T extends PrimitiveType> =
  T extends PrimitiveType.bigint
    ? bigint
    : T extends PrimitiveType.string
    ? string
    : T extends PrimitiveType.number
    ? number
    : T extends PrimitiveType.symbol
    ? symbol
    : T extends PrimitiveType.boolean
    ? boolean
    : T extends PrimitiveType.undefined
    ? undefined
    : never;
