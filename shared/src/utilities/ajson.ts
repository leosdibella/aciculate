import { PrimitiveTypeValueType } from 'src/types';
import { PrimitiveType } from '../enums';

const _whiteSpaceTokens = [' ', '\n', '\t', '\r'];

const circularReferenceToken = '/';

const _objectTokens = {
  open: '{',
  close: '}'
};

const _arrayTokens = {
  open: '[',
  close: ']'
};

const _primitiveSerializers: {
  [key in PrimitiveType]: (
    key: PrimitiveTypeValueType<key>
  ) => string | undefined;
} = {
  bigint: (value) => `BigInt(${value}n)`,
  string: (value) => `"${value}"`,
  number: (value) => `Number(${value})`,
  symbol: () => undefined,
  undefined: (value) => `${value}`,
  boolean: (value) => `Boolean(${value})`
};

const _serializers = {
  date: (value: Date) => `Date(${value.getTime()})`,
  primitive<T extends PrimitiveType>(
    value: PrimitiveTypeValueType<T>,
    type: PrimitiveType
  ) {
    const primitiveTypeSerializer = _primitiveSerializers[type];

    if (primitiveTypeSerializer) {
      return (
        primitiveTypeSerializer as (value: PrimitiveTypeValueType<T>) => string
      )(value);
    }
  },
  object(value: Record<string, unknown>) {
    return `{${Object.keys(value)
      .map((key) => ({
        key,
        value: _serializers.unknown(value[key])
      }))
      .filter((p) => p.value !== undefined)
      .map((p) => `${p.key}:${p.value}`)
      .join('\n')}}`;
  },
  array(value: unknown[]) {
    return `[${value
      .map((v) => _serializers.unknown(v))
      .filter((s) => s !== undefined)}]`;
  },
  unknown(value: unknown): string | undefined {
    const type = typeof value;

    if (PrimitiveType[type as PrimitiveType]) {
      const primitiveType = type as PrimitiveType;

      return _serializers.primitive(
        value as PrimitiveTypeValueType<typeof primitiveType>,
        primitiveType
      );
    }

    if (value === null) {
      return 'null';
    }

    if (value instanceof Date) {
      return _serializers.date(value);
    }

    if (type === 'function') {
      return undefined;
    }

    if (type === 'object') {
      if (Array.isArray(value)) {
        return _serializers.array(value);
      } else {
        return _serializers.object(value as Record<string, unknown>);
      }
    }
  }
};

function _serialize(value: unknown) {
  return _serializers.unknown(value);
}

function _deserialize(value: string) {

}

export const AJSON = {
  serialize: _serialize,
  deserialize: _deserialize
};
