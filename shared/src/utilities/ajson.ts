import { ReferenceType, ReferenceTypeValue, TypeValue } from '../types';
import { AjsonErrorCode, AjsonMethod, ValueType } from '../enums';
import {
  IBigIntTypeValue,
  IBooleanTypeValue,
  ICharacterLocation,
  IDateTypeValue,
  INullTypeValue,
  INumberTypeValue,
  IReferencePathTypeValue,
  IStringTypeValue,
  IUndefinedTypeValue
} from '../interfaces';
import { decimalBase } from './date-time';
import { AjsonError } from 'src/classes/ajson-error';

const _tokens = Object.freeze({
  null: `${null}`,
  undefined: `${undefined}`,
  boolean: Object.freeze([`${true}`, `${false}`]),
  delimiters: Object.freeze({
    string: '"',
    referencePath: '/',
    bigInt: 'n',
    date: '@'
  }),
  number: Object.freeze({
    decimal: '.',
    exponential: 'e',
    signs: Object.freeze(['-', '+']),
    digits: Object.freeze([...Array(decimalBase)].map((i) => `${i}`)),
    keywords: Object.freeze([`${Infinity}`, `${-Infinity}`, `${NaN}`])
  }),
  object: Object.freeze({
    open: '{',
    close: '}'
  }),
  array: Object.freeze({
    open: '[',
    close: ']'
  }),
  separators: Object.freeze({
    name: ':',
    value: ','
  }),
  whitespace: Object.freeze({
    space: ' ',
    newLine: '\n',
    tab: '\t',
    carriageReturn: '\r'
  })
});

const _keywordTokens = Object.freeze([
  _tokens.null,
  _tokens.undefined,
  ..._tokens.boolean,
  ..._tokens.number.keywords
]);

const _maxKeywordTokenLength = Math.max(..._keywordTokens.map((v) => v.length));

const _numberTokens = Object.freeze([
  _tokens.number.decimal,
  _tokens.number.exponential,
  ..._tokens.number.signs,
  ..._tokens.number.digits
]);

const _deserializers = Object.freeze({
  number(
    value: string,
    characterLocation: Readonly<ICharacterLocation>
  ): INumberTypeValue {
    const number = Number(value);

    if (isNaN(number)) {
      // TODO invalid number
      throw new AjsonError(
        '',
        AjsonMethod.deserialize,
        AjsonErrorCode.malformed,
        characterLocation
      );
    }

    return {
      valueType: ValueType.number,
      value: number
    };
  },
  delimited: Object.freeze({
    [_tokens.delimiters.bigInt](
      value: string,
      characterLocation: Readonly<ICharacterLocation>
    ): IBigIntTypeValue {
      try {
        const bigint = BigInt(value);

        return {
          valueType: ValueType.bigint,
          value: bigint
        };
      } catch {
        // TODO not a big int
        throw new AjsonError(
          '',
          AjsonMethod.deserialize,
          AjsonErrorCode.malformed,
          characterLocation
        );
      }
    },
    [_tokens.delimiters.date](
      value: string,
      characterLocation: Readonly<ICharacterLocation>
    ): IDateTypeValue {
      const date = new Date(value as string);

      if (isNaN(date.getTime())) {
        // TODO invalid date
        throw new AjsonError(
          '',
          AjsonMethod.deserialize,
          AjsonErrorCode.malformed,
          characterLocation
        );
      }

      return {
        valueType: ValueType.date,
        value: date
      };
    },
    [_tokens.delimiters.referencePath](
      value: string,
      characterLocation: Readonly<ICharacterLocation>,
      rootReferenceTypeValue: ReferenceTypeValue | undefined
    ): IReferencePathTypeValue {
      if (!rootReferenceTypeValue) {
        // TODO: This is impossible, it's malformed json
        throw new AjsonError(
          '',
          AjsonMethod.deserialize,
          AjsonErrorCode.malformed,
          characterLocation
        );
      }

      const referencePath = value
        .split(_tokens.delimiters.referencePath)
        .filter((p) => p);

      if (!referencePath) {
        return {
          valueType: ValueType.referencePath,
          value: rootReferenceTypeValue
        };
      }

      let referenceTypeValue = rootReferenceTypeValue;

      while (referencePath.length) {
        const key = referencePath.pop()!;

        referenceTypeValue = referenceTypeValue.value[
          key as keyof typeof referenceTypeValue.value
        ] as ReferenceTypeValue;

        if (referenceTypeValue === undefined) {
          // TODO undefined reference
          throw new AjsonError(
            '',
            AjsonMethod.deserialize,
            AjsonErrorCode.bug,
            characterLocation
          );
        }
      }

      return {
        valueType: ValueType.referencePath,
        value: referenceTypeValue
      };
    },
    [_tokens.delimiters.string](value: string): IStringTypeValue {
      return {
        valueType: ValueType.string,
        value
      };
    }
  }),
  keyword: Object.freeze({
    [_tokens.null](): INullTypeValue {
      return {
        valueType: ValueType.null,
        value: null
      };
    },
    [_tokens.undefined](): IUndefinedTypeValue {
      return {
        valueType: ValueType.undefined,
        value: undefined
      };
    },
    [_tokens.boolean[0]](): IBooleanTypeValue {
      return {
        valueType: ValueType.boolean,
        value: true
      };
    },
    [_tokens.boolean[1]](): IBooleanTypeValue {
      return {
        valueType: ValueType.boolean,
        value: false
      };
    },
    [_tokens.number.keywords[0]](): INumberTypeValue {
      return {
        valueType: ValueType.number,
        value: Number(_tokens.number.keywords[0])
      };
    },
    [_tokens.number.keywords[1]](): INumberTypeValue {
      return {
        valueType: ValueType.number,
        value: Number(_tokens.number.keywords[1])
      };
    },
    [_tokens.number.keywords[2]](): INumberTypeValue {
      return {
        valueType: ValueType.number,
        value: Number(_tokens.number.keywords[2])
      };
    }
  })
});

function _isReferenceType(value: unknown) {
  return value && (Array.isArray(value) || typeof value === 'object');
}

const _serialize = Object.freeze({
  bigint: (value: bigint) =>
    `${_tokens.delimiters.bigInt}${value}${_tokens.delimiters.bigInt}`,
  string: (value: string) => JSON.stringify(value),
  number: (value: number) => `${value}`,
  symbol: () => undefined,
  function: () => undefined,
  undefined: () => _tokens.undefined,
  boolean: (value: boolean) => `${value}`,
  date(value: Date, location?: string) {
    const time = value.getTime();

    if (isNaN(time)) {
      const errorPath = location ? ` at location: ${location}` : '';

      throw new AjsonError(
        `invalid date${errorPath}`,
        AjsonMethod.serialize,
        AjsonErrorCode.invalidDate
      );
    }

    return `${_tokens.delimiters.date}${JSON.stringify(value)
      .replace(_tokens.delimiters.string, '')
      .replace(_tokens.delimiters.string, '')}`;
  },
  object(
    value: ReferenceType,
    referencePaths: Map<ReferenceType, string>,
    location?: string
  ) {
    const referencePath = referencePaths.get(value as ReferenceType);

    if (Array.isArray(value)) {
      return (
        referencePath ??
        _serialize.arrayExtension(
          value,
          referencePaths,
          location ?? _tokens.delimiters.referencePath
        )
      );
    } else {
      return (
        referencePath ??
        _serialize.objectExtension(
          value as Record<string, unknown>,
          referencePaths,
          location ?? _tokens.delimiters.referencePath
        )
      );
    }
  },
  objectExtension(
    value: Record<string, unknown>,
    referencePaths: Map<ReferenceType, string>,
    location: string
  ) {
    return `{${Object.keys(value)
      .map((key) => ({
        key,
        value: _serialize.unknown(
          value[key],
          referencePaths,
          `${location}${key}${_tokens.delimiters.referencePath}`
        )
      }))
      .filter((p) => p.value !== undefined)
      .map((p) => `${_serialize.string(p.key)}:${p.value}`)
      .join()}}`;
  },
  arrayExtension(
    value: unknown[],
    referencePaths: Map<ReferenceType, string>,
    location: string
  ) {
    return `[${value
      .map((v, i) =>
        _serialize.unknown(
          v,
          referencePaths,
          `${location}${i}${_tokens.delimiters.referencePath}`
        )
      )
      .filter((s) => s !== undefined)
      .join()}]`;
  },
  unknown(
    value: unknown,
    referencePaths: Map<ReferenceType, string>,
    location?: string
  ): string | undefined {
    const type = typeof value;

    if (value === null) {
      return _tokens.null;
    }

    if (value instanceof Date) {
      return _serialize.date(value, location);
    }

    const serializer = _serialize[type] as (
      value: unknown,
      referencePaths: Map<ReferenceType, string>,
      location?: string
    ) => string | undefined;

    return serializer(value, referencePaths, location);
  }
});

function _buildReferncePaths(value: unknown) {
  const referencePaths = new Map<ReferenceType, string>();

  if (!_isReferenceType(value)) {
    return referencePaths;
  }

  const stack: { key: string; value: ReferenceType }[] = [
    {
      key: _tokens.delimiters.referencePath,
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
            key: `${keyValuePair.key}${i}${_tokens.delimiters.referencePath}`,
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
            key: `${keyValuePair.key}${objectKey}${_tokens.delimiters.referencePath}`,
            value: objectValue as ReferenceType
          });
        }
      });
    }
  }

  return referencePaths;
}

function _lexFiniteNumber(
  text: string,
  index: number,
  characterLocation: Readonly<ICharacterLocation>
) {
  let value = '';

  for (let i = index; i < text.length; ++i) {
    const character = text[i];

    if (_numberTokens.indexOf(character) === -1) {
      break;
    }

    value += character;
  }

  if (!value) {
    return {
      typeValue: undefined,
      lastCharacterIndex: undefined
    };
  }

  const typeValue = _deserializers.number(value, characterLocation);
  const lastCharacterIndex = value.length - 1 + value.length;

  return {
    typeValue,
    lastCharacterIndex
  };
}

function _appendTypeValue(
  referenceTypeValue: ReferenceTypeValue,
  typeValue: TypeValue
) {
  if (referenceTypeValue.valueType === ValueType.array) {
    referenceTypeValue.value.push(typeValue);
  } else {
    const unvaluedMember = referenceTypeValue.value.find((v) => !v.value);

    if (unvaluedMember) {
      unvaluedMember.value = typeValue;
    }
  }
}

function _appendPrimitiveTypeValue(
  text: string,
  referenceTypeValue: ReferenceTypeValue | undefined,
  typeValue: TypeValue | undefined,
  lastCharacterIndex: number | undefined,
  characterLocation: Readonly<ICharacterLocation>
) {
  if (!typeValue || !lastCharacterIndex) {
    return;
  }

  if (referenceTypeValue) {
    _appendTypeValue(referenceTypeValue, typeValue);

    return lastCharacterIndex + 1;
  } else {
    const remainingText = text.slice(lastCharacterIndex + 1).trim();

    if (remainingText) {
      // TODO malformed json
      throw new AjsonError(
        '',
        AjsonMethod.deserialize,
        AjsonErrorCode.malformed,
        characterLocation
      );
    }

    return typeValue;
  }
}

function _appendReferenceTypeValue(
  text: string,
  index: number,
  referenceTypeValue: ReferenceTypeValue | undefined,
  characterLocation: Readonly<ICharacterLocation>
) {
  const remainingText = text.slice(index).trim();
  let shouldContinue = false;

  if (!referenceTypeValue) {
    // TODO invalid json
    throw new AjsonError(
      '',
      AjsonMethod.deserialize,
      AjsonErrorCode.malformed,
      characterLocation
    );
  }

  if (remainingText) {
    if (!referenceTypeValue.parent) {
      // TODO invalid json
      throw new AjsonError(
        '',
        AjsonMethod.deserialize,
        AjsonErrorCode.malformed,
        characterLocation
      );
    }

    shouldContinue = true;
  }

  if (referenceTypeValue.parent) {
    _appendTypeValue(referenceTypeValue.parent, referenceTypeValue);
  }

  return {
    shouldContinue,
    nextReferenceTypeValue: shouldContinue
      ? referenceTypeValue.parent
      : referenceTypeValue?.parent ?? referenceTypeValue
  };
}

function _lexKeyword(text: string, index: number) {
  let value = '';

  for (let i = index; i < text.length; ++i) {
    value += text[i];

    if (_keywordTokens.indexOf(value) > -1) {
      break;
    }

    if (i - index >= _maxKeywordTokenLength) {
      break;
    }
  }

  const deserializer = _deserializers.keyword[value];
  const lastCharacterIndex = value.length - 1 + index;

  if (deserializer) {
    const typeValue = deserializer();

    return {
      typeValue,
      lastCharacterIndex
    };
  } else {
    return {
      typeValue: undefined,
      lastCharacterIndex: undefined
    };
  }
}

function _lexDelimitedType(
  text: string,
  index: number,
  delimiter: string,
  characterLocation: Readonly<ICharacterLocation>,
  rootReferenceTypeValue: ReferenceTypeValue | undefined
) {
  const deserializer =
    _deserializers.delimited[
      delimiter as keyof typeof _deserializers.delimited
    ];

  let value = '';

  for (let i = index; i < text.length; ++i) {
    const character = text[i];

    value += character;

    if (character === delimiter) {
      break;
    }
  }

  const lastCharacterIndex = value.length - 1 + index;
  const lastCharacter = text[lastCharacterIndex];

  if (lastCharacter !== delimiter) {
    // TODO not a valid delimited value
    throw new AjsonError(
      '',
      AjsonMethod.deserialize,
      AjsonErrorCode.malformed,
      characterLocation
    );
  }

  const typeValue = deserializer(
    value,
    characterLocation,
    rootReferenceTypeValue
  );

  return {
    typeValue,
    lastCharacterIndex
  };
}

function _lex(text: string): TypeValue {
  let rootReferenceTypeValue: ReferenceTypeValue | undefined;
  let referenceTypeValue: ReferenceTypeValue | undefined;
  let index = 0;
  let line = 0;
  let space = 0;
  let tab = 0;

  while (index < text.length) {
    const character = text[index];

    switch (character) {
      case _tokens.whitespace.tab:
      case _tokens.whitespace.space:
      case _tokens.whitespace.newLine:
      case _tokens.whitespace.carriageReturn: {
        switch (character) {
          case _tokens.whitespace.tab:
            ++tab;
            break;
          case _tokens.whitespace.space:
            ++space;
            break;
          case _tokens.whitespace.newLine:
          case _tokens.whitespace.carriageReturn:
            tab = 0;
            space = 0;

            if (character === _tokens.whitespace.newLine) {
              ++line;
            }

            break;
          default:
          // can't happen
        }

        ++index;
        continue;
      }
      case _tokens.separators.value: {
        ++index;
        continue;
      }
      case _tokens.array.open: {
        referenceTypeValue = {
          valueType: ValueType.array,
          value: [],
          parent: referenceTypeValue
        };

        if (!rootReferenceTypeValue) {
          rootReferenceTypeValue = referenceTypeValue;
        }

        ++index;
        continue;
      }
      case _tokens.object.open: {
        referenceTypeValue = {
          valueType: ValueType.object,
          value: [],
          parent: referenceTypeValue
        };

        if (!rootReferenceTypeValue) {
          rootReferenceTypeValue = referenceTypeValue;
        }

        const characterLocation = Object.freeze<ICharacterLocation>({
          tab,
          line,
          space
        });

        let name = '';

        for (let i = index; i < text.length; ++i) {
          const objectCharacter = text[i];

          if (
            objectCharacter !== _tokens.separators.name &&
            objectCharacter !== _tokens.object.close
          ) {
            name += objectCharacter;
            continue;
          }

          break;
        }

        const lastCharacterIndex = name.length - 1 + index;
        const lastCharacter = text[lastCharacterIndex];

        if (
          lastCharacter !== _tokens.object.close &&
          lastCharacterIndex === text.length - 1
        ) {
          // TODO not valid JSON
          throw new AjsonError(
            '',
            AjsonMethod.deserialize,
            AjsonErrorCode.malformed,
            characterLocation
          );
        }

        name = name.trim();

        if (name.length < 2 && lastCharacter !== _tokens.object.close) {
          // TODO missing property name
          throw new AjsonError(
            '',
            AjsonMethod.deserialize,
            AjsonErrorCode.malformed,
            characterLocation
          );
        }

        if (
          name[0] !== _tokens.delimiters.string ||
          name[name.length - 1] !== _tokens.delimiters.string
        ) {
          // TODO not valid JSON missing quotes around property name
          throw new AjsonError(
            '',
            AjsonMethod.deserialize,
            AjsonErrorCode.malformed,
            characterLocation
          );
        }

        referenceTypeValue.value.push({
          name
        });

        index =
          lastCharacterIndex + (lastCharacter === _tokens.object.close ? 0 : 1);

        continue;
      }
      case _tokens.array.close:
      case _tokens.object.close: {
        ++index;

        const { shouldContinue, nextReferenceTypeValue } =
          _appendReferenceTypeValue(text, index, referenceTypeValue, {
            tab,
            line,
            space
          });

        if (shouldContinue) {
          referenceTypeValue = nextReferenceTypeValue;
          continue;
        }

        return nextReferenceTypeValue!;
      }
      case _tokens.delimiters.date:
      case _tokens.delimiters.bigInt:
      case _tokens.delimiters.string:
      case _tokens.delimiters.referencePath: {
        const characterLocation = Object.freeze<ICharacterLocation>({
          tab,
          line,
          space
        });

        const { lastCharacterIndex, typeValue } = _lexDelimitedType(
          text,
          index,
          character,
          characterLocation,
          rootReferenceTypeValue
        );

        const result = _appendPrimitiveTypeValue(
          text,
          referenceTypeValue,
          typeValue,
          lastCharacterIndex,
          characterLocation
        );

        if (typeof result === 'number') {
          index = result;
          continue;
        } else if (typeof result === 'object') {
          return result;
        } else {
          ++index;
          continue;
        }
      }
      default: {
        const characterLocation = Object.freeze<ICharacterLocation>({
          tab,
          line,
          space
        });

        const lexedKeyword = _lexKeyword(text, index);

        const keywordResult = _appendPrimitiveTypeValue(
          text,
          referenceTypeValue,
          lexedKeyword.typeValue,
          lexedKeyword.lastCharacterIndex,
          characterLocation
        );

        if (typeof keywordResult === 'number') {
          index = keywordResult;
          continue;
        } else if (typeof keywordResult === 'object') {
          return keywordResult;
        }

        const lexedFiniteNumber = _lexFiniteNumber(
          text,
          index,
          characterLocation
        );

        const numberResult = _appendPrimitiveTypeValue(
          text,
          referenceTypeValue,
          lexedFiniteNumber.typeValue,
          lexedFiniteNumber.lastCharacterIndex,
          characterLocation
        );

        if (typeof numberResult === 'number') {
          index = numberResult;
          continue;
        } else if (typeof numberResult === 'object') {
          return numberResult;
        } else {
          ++index;
          continue;
        }
      }
    }
  }

  return referenceTypeValue!;
}

function _parse(typeValue: TypeValue, rootReference?: ReferenceType): unknown {
  switch (typeValue.valueType) {
    case ValueType.null:
    case ValueType.date:
    case ValueType.string:
    case ValueType.bigint:
    case ValueType.number:
    case ValueType.boolean:
    case ValueType.undefined:
    case ValueType.referencePath: {
      return typeValue.value;
    }
    case ValueType.array: {
      const reference: ReferenceType = [];
      const elements = typeValue.value;

      for (let i = 0; i < elements.length; ++i) {
        reference.push(_parse(elements[i], rootReference ?? reference));
      }

      return reference;
    }
    case ValueType.object: {
      const reference: ReferenceType = {};
      const members = typeValue.value;

      for (let i = 0; i < members.length; ++i) {
        const memberValue = members[i].value;

        if (!memberValue) {
          // TODO never assigned value to property
          throw new AjsonError(
            '',
            AjsonMethod.deserialize,
            AjsonErrorCode.malformed
          );
        }

        reference[members[i].name] = _parse(
          memberValue,
          rootReference ?? reference
        );
      }

      return reference;
    }
    default: {
      // TODO something went horribly wrong
      throw new AjsonError(
        '',
        AjsonMethod.deserialize,
        AjsonErrorCode.malformed
      );
    }
  }
}

export const ajson = Object.freeze({
  serialize(value: unknown) {
    return _serialize.unknown(value, _buildReferncePaths(value));
  },
  deserialize(text: string): unknown {
    return _parse(_lex(text));
  }
});
