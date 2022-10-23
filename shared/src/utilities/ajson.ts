import { PrimitiveTypeValueType, ReferenceType } from '../types';
import { PrimitiveType, ValueType } from '../enums';
import { IMemberType, IValueType } from '../interfaces';

const _whiteSpaceTokens = [' ', '\n', '\t', '\r'];
const _referencePathToken = '/';
const _datePrefixToken = '@';
const _bigIntSuffixToken = 'n';
const _stringDelimiterToken = '"';

function _isReferenceType(value: unknown) {
  return value && (Array.isArray(value) || typeof value === 'object');
}

const _objectTokens = {
  open: '{',
  separator: ',',
  delimiter: ':',
  close: '}'
};

const _arrayTokens = {
  open: '[',
  separator: ',',
  close: ']'
};

const _primitiveSerializers: {
  [key in PrimitiveType]: (
    key: PrimitiveTypeValueType<key>
  ) => string | undefined;
} = {
  bigint: (value) => `${value}${_bigIntSuffixToken}`,
  string: (value) => `"${value}"`,
  number: (value) => `${value}`,
  symbol: () => undefined,
  undefined: (value) => `${value}`,
  boolean: (value) => `${value}`
};

const _serializers = {
  date: (value: Date) => `${_datePrefixToken}${value.getTime()}`,
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
  object(
    value: Record<string, unknown>,
    referencePaths: Map<ReferenceType, string>
  ) {
    return `{${Object.keys(value)
      .map((key) => ({
        key,
        value: _serializers.unknown(value[key], referencePaths)
      }))
      .filter((p) => p.value !== undefined)
      .map((p) => `"${p.key}":${p.value}`)
      .join()}}`;
  },
  array(value: unknown[], referencePaths: Map<ReferenceType, string>) {
    return `[${value
      .map((v) => _serializers.unknown(v, referencePaths))
      .filter((s) => s !== undefined)
      .join()}]`;
  },
  unknown(
    value: unknown,
    referencePaths: Map<ReferenceType, string>
  ): string | undefined {
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
      const referncePath = referencePaths.get(value as ReferenceType);

      if (Array.isArray(value)) {
        return referncePath ?? _serializers.array(value, referencePaths);
      } else {
        return (
          referncePath ??
          _serializers.object(value as Record<string, unknown>, referencePaths)
        );
      }
    }
  }
};

function _buildReferncePaths(value: unknown) {
  const referencePaths = new Map<ReferenceType, string>();

  if (!_isReferenceType(value)) {
    return referencePaths;
  }

  const stack: { key: string; value: ReferenceType }[] = [
    {
      key: _referencePathToken,
      value: value as ReferenceType
    }
  ];

  while (stack.length) {
    const keyValuePair = stack.pop()!;

    const referencePath = referencePaths.get(keyValuePair.value);

    if (referencePath) {
      continue;
    }

    referencePaths.set(keyValuePair.value, keyValuePair.key);

    if (Array.isArray(keyValuePair.value)) {
      keyValuePair.value.forEach((arrayValue, i) => {
        if (_isReferenceType(arrayValue)) {
          stack.push({
            key: `${keyValuePair.key}${i}${_referencePathToken}`,
            value: arrayValue
          });
        }
      });
    } else {
      Object.keys(keyValuePair.value).forEach((objectKey) => {
        const objectValue = (keyValuePair.value as Record<string, unknown>)[
          objectKey
        ];

        if (_isReferenceType(objectValue)) {
          stack.push({
            key: `${keyValuePair.key}${objectKey}${_referencePathToken}`,
            value: objectValue as ReferenceType
          });
        }
      });
    }
  }

  return referencePaths;
}

function _serialize(value: unknown) {
  const referencePaths = _buildReferncePaths(value);

  return _serializers.unknown(value, referencePaths);
}

function _lexer(text: string) {
  const abstractSyntaxTree: IValueType = {};

  let currentToken = '';

  for (let i = 0; text.length; ++i) {
    const character = text[i];

    if (!currentToken && _whiteSpaceTokens.indexOf(character) > -1) {
      continue;
    }
  }

  return abstractSyntaxTree;
}

function _parser(value: IValueType, rootReference?: ReferenceType): unknown {
  switch (value.valueType) {
    case ValueType.null:
      return null;
    case ValueType.undefined:
      return undefined;
    case ValueType.string:
      return value.value;
    case ValueType.bigint:
      return BigInt(value.value as string);
    case ValueType.number:
      return Number(value.value as string);
    case ValueType.boolean:
      return value.value === 'true';
    case ValueType.date:
      return new Date(value.value as string);
    case ValueType.referencePath: {
      if (!rootReference) {
        // TODO: This is impossible
        throw new Error();
      }

      const referencePath = (value.value as string)
        .split(_referencePathToken)
        .filter((p) => p);

      if (!referencePath) {
        return rootReference;
      }

      let reference = rootReference;

      while (referencePath.length) {
        const key = referencePath.pop()!;

        reference = reference[key as keyof typeof reference] as ReferenceType;
      }

      return reference;
    }
    case ValueType.array: {
      const reference: ReferenceType = [];
      const elements = value.value as IValueType[];

      for (let i = 0; i < elements.length; ++i) {
        reference.push(_parser(elements[i], rootReference ?? reference));
      }

      return reference;
    }
    case ValueType.object: {
      const reference: ReferenceType = {};
      const members = value.value as IMemberType[];

      for (let i = 0; i < members.length; ++i) {
        reference[members[i].name] = _parser(
          members[i].value,
          rootReference ?? reference
        );
      }

      return reference;
    }
    default: {
      // TODO
      throw new Error();
    }
  }
}

function _deserialize(value: string): unknown {
  return _parser(_lexer(value));
}

export const AJSON = {
  serialize: _serialize,
  deserialize: _deserialize
};
