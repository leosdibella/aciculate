import { ReferenceType, ValueTypeValue } from '../types';
import { ValueType } from '../enums';
import { IMemberType, IPrimitiveValueType } from '../interfaces';

const _whiteSpaceTokens = [' ', '\n', '\t', '\r'];
const _referencePathToken = '/';
const _datePrefixToken = '@';
const _bigIntSuffixToken = 'n';
const _stringDelimiterToken = '"';

function _isReferenceType(value: unknown) {
  return value && (Array.isArray(value) || typeof value === 'object');
}

const _nullToken = 'null';
const _undefinedToken = 'undefined';

const _numericalTokens = {
  decimal: '.',
  negativeSign: '-',
  exponential: 'e',
  edgeCases: ['Infinity', '-Infinity', 'NaN', '-NaN']
};

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

const _booleanTokens = {
  true: 'true',
  false: 'false'
};

const _serializers = {
  bigint: (value: bigint) => `${value}${_bigIntSuffixToken}`,
  string: (value: string) => `"${value}"`,
  number: (value: number) => `${value}`,
  symbol: () => undefined,
  function: () => undefined,
  undefined: () => _undefinedToken,
  boolean: (value: boolean) => `${value}`,
  date: (value: Date) => `${_datePrefixToken}${value.getTime()}`,
  object(value: ReferenceType, referencePaths: Map<ReferenceType, string>) {
    const referncePath = referencePaths.get(value as ReferenceType);

    if (Array.isArray(value)) {
      return referncePath ?? _serializers.arrayExtension(value, referencePaths);
    } else {
      return (
        referncePath ??
        _serializers.objectExtension(
          value as Record<string, unknown>,
          referencePaths
        )
      );
    }
  },
  objectExtension(
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
  arrayExtension(value: unknown[], referencePaths: Map<ReferenceType, string>) {
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

    if (value === null) {
      return _nullToken;
    }

    if (value instanceof Date) {
      return _serializers.date(value);
    }

    const serializer = _serializers[type] as (
      value: unknown,
      referencePaths: Map<ReferenceType, string>
    ) => string | undefined;

    return serializer(value, referencePaths);
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

function _lexNumber(
  value: string
): { valueType: ValueType.number; value: string } | Record<string, never> {
  // TODO lex numbers

  return {};
}

function _lexPrimitieValue(
  value: string
): IPrimitiveValueType | Record<string, never> {
  const sanitizedValue = value.trim();
  const firstCharacter = value[0];

  switch (firstCharacter) {
    case _datePrefixToken:
      return {
        valueType: ValueType.date,
        value: sanitizedValue.slice(1).trim()
      };
    case _stringDelimiterToken: {
      const lastDelimitedIndex = sanitizedValue.lastIndexOf(
        _stringDelimiterToken
      );

      if (lastDelimitedIndex === -1) {
        // TODO
        throw new Error();
      }

      return {
        valueType: ValueType.string,
        value: sanitizedValue.slice(1, lastDelimitedIndex)
      };
    }
    case _referencePathToken: {
      const lastDelimitedIndex =
        sanitizedValue.lastIndexOf(_referencePathToken);

      if (lastDelimitedIndex === -1) {
        // TODO not a valid reference path
        throw new Error();
      }

      return {
        valueType: ValueType.referencePath,
        value: sanitizedValue
      };
    }
    default: {
      const lastCharacter = value[value.length - 1];

      if (lastCharacter === _bigIntSuffixToken) {
        if (sanitizedValue.length > 1) {
          return {
            valueType: ValueType.bigint,
            value: sanitizedValue.slice(0, sanitizedValue.length - 1)
          };
        } else {
          // Missing numerical info for big int
          throw new Error();
        }
      }

      if (
        sanitizedValue === _booleanTokens.true ||
        sanitizedValue === _booleanTokens.false
      ) {
        return {
          valueType: ValueType.boolean,
          value: sanitizedValue
        };
      }

      if (sanitizedValue === _nullToken) {
        return {
          valueType: ValueType.null,
          value: _nullToken
        };
      }

      if (sanitizedValue === _undefinedToken) {
        return {
          valueType: ValueType.undefined,
          value: _undefinedToken
        };
      }

      if (_numericalTokens.edgeCases.indexOf(sanitizedValue) > -1) {
        return {
          valueType: ValueType.number,
          value: sanitizedValue
        };
      }

      return _lexNumber(sanitizedValue);
    }
  }
}

function _lexer(text: string): ValueTypeValue {
  const abstractSyntaxTree: ValueTypeValue = {};
  const sanitizedText = text.trim();

  if (!sanitizedText) {
    return abstractSyntaxTree;
  }

  if (
    sanitizedText[0] !== _objectTokens.open ||
    sanitizedText[0] !== _arrayTokens.open
  ) {
    return _lexPrimitieValue(sanitizedText);
  }

  for (let i = 0; text.length; ++i) {
    const character = text[i];

    if (_whiteSpaceTokens.indexOf(character) > -1) {
      continue;
    }

    // TODO lex objects and arrays
  }

  return abstractSyntaxTree;
}

function _parser(
  value: ValueTypeValue,
  rootReference?: ReferenceType
): unknown {
  switch (value.valueType) {
    case ValueType.null:
      return null;
    case ValueType.undefined:
      return undefined;
    case ValueType.string:
      return value.value;
    case ValueType.bigint:
      try {
        const bigint = BigInt(value.value as string);

        return bigint;
      } catch {
        // TODO not a big int
        throw new Error();
      }
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
      const elements = value.value as ValueTypeValue[];

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
