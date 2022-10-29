import {
  ReferencePathPiece,
  ReferenceType,
  ReferenceTypeValue,
  TypeValue
} from '../types';
import { ObeliskErrorCode, ObeliskMethod, ValueType } from '../enums';
import {
  IBigIntTypeValue,
  IBooleanTypeValue,
  ICharacterLocation,
  IDateTypeValue,
  INullTypeValue,
  INumberTypeValue,
  IReferenceLocation,
  IReferencePathTypeValue,
  IStringTypeValue,
  IUndefinedTypeValue
} from '../interfaces';
import { ObeliskError } from '../classes';

const _referencePathPiecesSymbol = Symbol('obelisk_reference_path_pieces');
const _decimalBase = 10;

const _tokens = Object.freeze({
  null: `${null}`,
  undefined: `${undefined}`,
  boolean: Object.freeze([`${true}`, `${false}`]),
  delimiters: Object.freeze({
    string: '"',
    bigInt: 'n',
    date: '@'
  }),
  number: Object.freeze({
    decimal: '.',
    exponential: 'e',
    signs: Object.freeze(['-', '+']),
    digits: Object.freeze([...Array(_decimalBase)].map((_, i) => `${i}`)),
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
    value: ',',
    referencePath: '/'
  }),
  whitespace: Object.freeze({
    space: ' ',
    newLine: '\n',
    tab: '\t',
    carriageReturn: '\r'
  })
});

const _whiteSpaceTokens: string[] = Object.values(_tokens.whitespace);

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

const _rootReferencePath = `${_tokens.separators.referencePath}${_tokens.separators.referencePath}`;

const _valueTypePathReferenceWrappers = Object.freeze({
  [ValueType.array]: Object.freeze([_tokens.array.open, _tokens.array.close]),
  [ValueType.object]: Object.freeze([_tokens.object.open, _tokens.object.close])
});

function _isReferenceType(value: unknown) {
  return value && (Array.isArray(value) || typeof value === 'object');
}

function _deserializeString(value: string): IStringTypeValue {
  return {
    valueType: ValueType.string,
    value: JSON.parse(value)
  };
}

function _serializeString(value: string) {
  return JSON.stringify(value);
}

function _serializeDate(value: Date) {
  return JSON.stringify(value);
}

function _getReferencePathPieceType(value: string) {
  const type =
    value[0] === _tokens.object.open
      ? ValueType.object
      : value[0] === _tokens.array.open
      ? ValueType.array
      : undefined;

  const typeConfirmation =
    value[value.length - 1] === _tokens.object.close
      ? ValueType.object
      : value[value.length - 1] === _tokens.array.close
      ? ValueType.array
      : undefined;

  return {
    type,
    typeConfirmation
  };
}

function _deserializeReferencePathPiece(
  serialized: string,
  characterLocation?: ICharacterLocation
) {
  const { type, typeConfirmation } = _getReferencePathPieceType(serialized);

  if (type === undefined || type !== typeConfirmation) {
    // TODO: This is impossible, it's malformed json
    throw new ObeliskError(
      '',
      ObeliskMethod.deserialize,
      ObeliskErrorCode.malformed,
      characterLocation
    );
  }

  const deserialized = _deserializeString(
    serialized.slice(1, serialized.length - 1)
  );

  let value: number | string;

  if (type === ValueType.array) {
    value = +deserialized.value;

    if (!Number.isInteger(value) || value < 0) {
      // TODO: This is impossible, it's malformed json
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed,
        characterLocation
      );
    }
  } else {
    value = deserialized.value;
  }

  return {
    value,
    type
  } as ReferencePathPiece;
}

function _lexReferencePathTypeValue(
  text: string,
  index: number,
  characterLocation?: Readonly<ICharacterLocation>
) {
  let value = '';
  const values: string[] = [];

  for (let i = index; i < text.length; ++i) {
    const character = text[i];

    if (character === _tokens.separators.referencePath) {
      if (value) {
        const { type, typeConfirmation } = _getReferencePathPieceType(value);

        if (
          type === undefined ||
          type !== typeConfirmation ||
          value[1] !== _tokens.delimiters.string ||
          value[value.length - 2] !== _tokens.delimiters.string
        ) {
          // TODO invalid referencePath
          throw new ObeliskError(
            '',
            ObeliskMethod.deserialize,
            ObeliskErrorCode.malformed,
            characterLocation
          );
        }

        values.push(value);
      }

      value = '';
      continue;
    }

    if (
      value === '' &&
      character !== _tokens.array.open &&
      character !== _tokens.object.open
    ) {
      break;
    }

    value += character;
  }

  const lexedReferencePath = `${_tokens.separators.referencePath}${values.join(
    _tokens.separators.referencePath
  )}${_tokens.separators.referencePath}`;

  const lastCharacterIndex = lexedReferencePath.length + index;

  if (value) {
    // TODO invalid referencePath
    throw new ObeliskError(
      '',
      ObeliskMethod.deserialize,
      ObeliskErrorCode.malformed,
      characterLocation
    );
  }

  const typeValue: IReferencePathTypeValue = {
    valueType: ValueType.referencePath,
    value: {
      [_referencePathPiecesSymbol]: values
        .filter((v) => v)
        .map((v) => _deserializeReferencePathPiece(v, characterLocation))
    }
  };

  return {
    typeValue,
    lastCharacterIndex
  };
}

function _extendReferencePath(
  referencePath: string,
  value: string,
  valueType: ValueType.object | ValueType.array
) {
  const wrappers = _valueTypePathReferenceWrappers[valueType];

  if (referencePath === _rootReferencePath) {
    return `${_tokens.separators.referencePath}${wrappers[0]}${_serializeString(
      value
    )}${wrappers[1]}${_tokens.separators.referencePath}`;
  }

  return `${referencePath}${wrappers[0]}${_serializeString(value)}${
    wrappers[1]
  }${_tokens.separators.referencePath}`;
}

const _serialize = Object.freeze({
  bigint: (value: bigint) =>
    `${_tokens.delimiters.bigInt}${value}${_tokens.delimiters.bigInt}`,
  string: _serializeString,
  number: (value: number) => `${value}`,
  symbol: () => undefined,
  function: () => undefined,
  undefined: () => _tokens.undefined,
  boolean: (value: boolean) => `${value}`,
  date(value: Date, location?: string) {
    const time = value.getTime();

    if (isNaN(time)) {
      const errorPath = location ? ` at location: ${location}` : '';

      throw new ObeliskError(
        `invalid date${errorPath}`,
        ObeliskMethod.serialize,
        ObeliskErrorCode.invalidDate
      );
    }

    return `${_tokens.delimiters.date}${_serializeDate(value)}${
      _tokens.delimiters.date
    }`;
  },
  object(
    value: ReferenceType,
    referencePaths: Map<ReferenceType, IReferenceLocation>,
    location?: string
  ) {
    const referencePath = location
      ? referencePaths.get(value as ReferenceType)
      : undefined;

    let referencePathLocation: string | undefined;

    if (referencePath) {
      if (referencePath.visited) {
        referencePathLocation = referencePath.location;
      } else {
        referencePaths.set(value, {
          location: referencePath.location,
          visited: true
        });
      }
    }

    if (Array.isArray(value)) {
      return (
        referencePathLocation ??
        _serialize.arrayExtension(
          value,
          referencePaths,
          location ?? _rootReferencePath
        )
      );
    } else {
      return (
        referencePathLocation ??
        _serialize.objectExtension(
          value as Record<string, unknown>,
          referencePaths,
          location ?? _rootReferencePath
        )
      );
    }
  },
  objectExtension(
    value: Record<string, unknown>,
    referencePaths: Map<ReferenceType, IReferenceLocation>,
    location: string
  ) {
    return `{${Object.keys(value)
      .map((key) => ({
        key,
        value: _serialize.unknown(
          value[key],
          referencePaths,
          _extendReferencePath(location, key, ValueType.object)
        )
      }))
      .filter((p) => p.value !== undefined)
      .map((p) => `${_serialize.string(p.key)}:${p.value}`)
      .join()}}`;
  },
  arrayExtension(
    value: unknown[],
    referencePaths: Map<ReferenceType, IReferenceLocation>,
    location: string
  ) {
    console.log(referencePaths);
    console.log(location);
    console.log(value);

    return `[${value
      .map((v, i) =>
        _serialize.unknown(
          v,
          referencePaths,
          _extendReferencePath(location, `${i}`, ValueType.array)
        )
      )
      .filter((s) => s !== undefined)
      .join()}]`;
  },
  unknown(
    value: unknown,
    referencePaths: Map<ReferenceType, IReferenceLocation>,
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
      referencePaths: Map<ReferenceType, IReferenceLocation>,
      location?: string
    ) => string | undefined;

    return serializer(value, referencePaths, location);
  }
});

function _buildReferncePaths(value: unknown) {
  const referencePaths = new Map<ReferenceType, IReferenceLocation>();

  if (!_isReferenceType(value)) {
    return referencePaths;
  }

  const stack: { key: string; value: ReferenceType }[] = [
    {
      key: _rootReferencePath,
      value: value as ReferenceType
    }
  ];

  while (stack.length) {
    const keyValuePair = stack.pop()!;
    const referencePath = referencePaths.get(keyValuePair.value);

    if (referencePath) {
      continue;
    }

    referencePaths.set(keyValuePair.value, {
      location: keyValuePair.key,
      visited: false
    });

    // Note the keys need to be reveresed so they are plucked from the stack in alpha/numerical order
    // this preserves order as they are ordered by first appearance, and traversed by first appearance
    // when deserialized into actual references.
    if (Array.isArray(keyValuePair.value)) {
      [...keyValuePair.value].reverse().forEach((element, i) => {
        if (_isReferenceType(element)) {
          stack.push({
            key: _extendReferencePath(
              keyValuePair.key,
              `${i}`,
              ValueType.array
            ),
            value: element
          });
        }
      });
    } else {
      Object.keys(keyValuePair.value)
        .reverse()
        .forEach((propertyName) => {
          const property = (keyValuePair.value as Record<string, unknown>)[
            propertyName
          ];

          if (_isReferenceType(property)) {
            stack.push({
              key: _extendReferencePath(
                keyValuePair.key,
                propertyName,
                ValueType.object
              ),
              value: property as ReferenceType
            });
          }
        });
    }
  }

  return referencePaths;
}

function _isValidReferencePoint(
  reference: ReferenceType,
  piece: ReferencePathPiece
) {
  return (
    (Array.isArray(reference) && piece.type === ValueType.array) ||
    (!Array.isArray(reference) && piece.type === ValueType.object)
  );
}

function _resolveReference(
  reference: ReferenceType,
  referencePathPieces: ReferencePathPiece[]
) {
  const reveresedReferencePathPieces = [...referencePathPieces].reverse();
  let resolvedReference = reference;

  while (reveresedReferencePathPieces.length) {
    const referencePathPiece = reveresedReferencePathPieces.pop()!;

    if (_isValidReferencePoint(resolvedReference, referencePathPiece)) {
      resolvedReference = resolvedReference[
        referencePathPiece.value as keyof typeof resolvedReference
      ] as ReferenceType;
    } else {
      // TODO invalid referencePath
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed
      );
    }

    if (!resolvedReference || typeof resolvedReference !== 'object') {
      // TODO invalid referencePath
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed
      );
    }
  }

  return resolvedReference;
}

function _replaceSymbolicReferences(
  value: ReferenceType,
  referencePathLocations: Record<string, ReferencePathPiece[]>
) {
  Object.keys(referencePathLocations).forEach((referencePathLocation) => {
    const referencePathPieces = referencePathLocations[referencePathLocation];

    const locationPathPieces = _lexReferencePathTypeValue(
      referencePathLocation,
      0
    ).typeValue.value[_referencePathPiecesSymbol].reverse();

    let reference = value;

    while (locationPathPieces.length - 1 > 0) {
      const locationPathPiece = locationPathPieces.pop()!;

      if (_isValidReferencePoint(reference, locationPathPiece)) {
        reference = reference[
          locationPathPiece.value as keyof typeof reference
        ] as ReferenceType;
      } else {
        // TODO invalid referencePath
        throw new ObeliskError(
          '',
          ObeliskMethod.deserialize,
          ObeliskErrorCode.malformed
        );
      }

      if (!reference || typeof reference !== 'object') {
        // TODO invalid referencePath
        throw new ObeliskError(
          '',
          ObeliskMethod.deserialize,
          ObeliskErrorCode.malformed
        );
      }
    }

    const lastLocationPathPiece = locationPathPieces.pop()!;

    if (!_isValidReferencePoint) {
      // TODO invalid referencePath
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed
      );
    }

    const referencedSymbolLocation = reference[
      lastLocationPathPiece.value as keyof typeof reference
    ] as Record<symbol, ReferencePathPiece[]>;

    if (
      typeof referencedSymbolLocation !== 'object' ||
      referencedSymbolLocation[_referencePathPiecesSymbol] !==
        referencePathPieces
    ) {
      // TODO invalid referencePath
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed
      );
    }

    const resolvedReferense = _resolveReference(value, referencePathPieces);

    (reference[
      lastLocationPathPiece.value as keyof typeof reference
    ] as ReferenceType) = resolvedReferense;
  });
}

function _resolveRefernecePaths(value: ReferenceType) {
  const stack: { key: string; value: ReferenceType }[] = [
    {
      key: _rootReferencePath,
      value
    }
  ];

  const referencePathLocations: Record<string, ReferencePathPiece[]> = {};

  while (stack.length) {
    const keyValuePair = stack.pop()!;

    if (Array.isArray(keyValuePair.value)) {
      keyValuePair.value.forEach((element, i) => {
        if (_isReferenceType(element)) {
          const symbols = Object.getOwnPropertySymbols(element);

          if (symbols[0] === _referencePathPiecesSymbol) {
            referencePathLocations[
              _extendReferencePath(keyValuePair.key, `${i}`, ValueType.array)
            ] = element[_referencePathPiecesSymbol];
          } else {
            stack.push({
              key: _extendReferencePath(
                keyValuePair.key,
                `${i}`,
                ValueType.array
              ),
              value: element
            });
          }
        }
      });
    } else {
      Object.keys(keyValuePair.value)
        .reverse()
        .forEach((propertyName) => {
          const property = (keyValuePair.value as Record<string, unknown>)[
            propertyName
          ];

          if (_isReferenceType(property)) {
            const symbols = Object.getOwnPropertySymbols(property);

            if (symbols[0] === _referencePathPiecesSymbol) {
              referencePathLocations[
                _extendReferencePath(
                  keyValuePair.key,
                  propertyName,
                  ValueType.object
                )
              ] = (property as Record<symbol, ReferencePathPiece[]>)[
                _referencePathPiecesSymbol
              ];
            } else {
              stack.push({
                key: _extendReferencePath(
                  keyValuePair.key,
                  propertyName,
                  ValueType.object
                ),
                value: property as ReferenceType
              });
            }
          }
        });
    }
  }

  _replaceSymbolicReferences(value, referencePathLocations);
}

const _deserializers = Object.freeze({
  number(
    value: string,
    characterLocation: Readonly<ICharacterLocation>
  ): INumberTypeValue {
    const number = Number(value);

    if (isNaN(number)) {
      // TODO invalid number
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed,
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
        const bigIntString = value
          .replace(_tokens.delimiters.bigInt, '')
          .replace(_tokens.delimiters.bigInt, '');

        const bigInt = BigInt(bigIntString);

        return {
          valueType: ValueType.bigint,
          value: bigInt
        };
      } catch {
        // TODO not a big int
        throw new ObeliskError(
          '',
          ObeliskMethod.deserialize,
          ObeliskErrorCode.malformed,
          characterLocation
        );
      }
    },
    [_tokens.delimiters.date](
      value: string,
      characterLocation: Readonly<ICharacterLocation>
    ): IDateTypeValue {
      const dateString = _deserializers.delimited[_tokens.delimiters.string](
        value
          .replace(_tokens.delimiters.date, '')
          .replace(_tokens.delimiters.date, '')
      ).value;

      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        // TODO invalid date
        throw new ObeliskError(
          '',
          ObeliskMethod.deserialize,
          ObeliskErrorCode.malformed,
          characterLocation
        );
      }

      return {
        valueType: ValueType.date,
        value: date
      };
    },
    [_tokens.delimiters.string]: _deserializeString
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
  const lastCharacterIndex = value.length + index;

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

    return lastCharacterIndex;
  } else {
    const remainingText = text.slice(lastCharacterIndex).trim();

    if (remainingText) {
      // TODO malformed json
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed,
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
    throw new ObeliskError(
      '',
      ObeliskMethod.deserialize,
      ObeliskErrorCode.malformed,
      characterLocation
    );
  }

  if (remainingText) {
    if (!referenceTypeValue.parent) {
      // TODO invalid json
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed,
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

function _lexKeywordTypeValue(text: string, index: number) {
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
  const lastCharacterIndex = value.length + index;

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

function _lexDelimitedTypeValue(
  text: string,
  index: number,
  delimiter: string,
  characterLocation: Readonly<ICharacterLocation>
) {
  const deserializer =
    _deserializers.delimited[
      delimiter as keyof typeof _deserializers.delimited
    ];

  let value = '';

  for (let i = index; i < text.length; ++i) {
    const character = text[i];

    value += character;

    if (character === delimiter && i > index) {
      break;
    }
  }

  const lastCharacterIndex = value.length + index;
  const lastCharacter = text[lastCharacterIndex - 1];

  if (lastCharacter !== delimiter) {
    // TODO not a valid delimited value
    throw new ObeliskError(
      '',
      ObeliskMethod.deserialize,
      ObeliskErrorCode.malformed,
      characterLocation
    );
  }

  const typeValue = deserializer(value, characterLocation);

  return {
    typeValue,
    lastCharacterIndex
  };
}

function _lex(text: string): TypeValue {
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
      case _tokens.separators.name:
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

        ++index;
        continue;
      }
      case _tokens.object.open: {
        referenceTypeValue = {
          valueType: ValueType.object,
          value: [],
          parent: referenceTypeValue
        };

        const characterLocation = Object.freeze<ICharacterLocation>({
          tab,
          line,
          space
        });

        let name = '';
        let quotePosition: -1 | 0 | 1 = -1;
        let charactersExamined = 1;

        for (let i = index + 1; i < text.length; ++i) {
          const objectCharacter = text[i];

          if (_whiteSpaceTokens.indexOf(objectCharacter) > -1) {
            if (quotePosition === -1 || quotePosition === 1) {
              ++charactersExamined;
              continue;
            }
          }

          if (objectCharacter === _tokens.delimiters.string) {
            if (quotePosition === -1) {
              quotePosition = 0;
            } else if (quotePosition === 0) {
              quotePosition = 1;
            }
          }

          if (
            objectCharacter !== _tokens.separators.name &&
            objectCharacter !== _tokens.object.close
          ) {
            ++charactersExamined;
            name += objectCharacter;
            continue;
          }

          break;
        }

        // the +1 is for the ":" value
        const lastCharacterIndex = index + charactersExamined + 1;
        const lastCharacter = text[lastCharacterIndex];

        if (
          lastCharacter !== _tokens.object.close &&
          lastCharacterIndex === text.length - 1
        ) {
          // TODO not valid JSON
          throw new ObeliskError(
            '',
            ObeliskMethod.deserialize,
            ObeliskErrorCode.malformed,
            characterLocation
          );
        }

        name = name.trim();

        if (name.length < 2 && lastCharacter !== _tokens.object.close) {
          // TODO missing property name
          throw new ObeliskError(
            '',
            ObeliskMethod.deserialize,
            ObeliskErrorCode.malformed,
            characterLocation
          );
        }

        if (
          name[0] !== _tokens.delimiters.string ||
          name[name.length - 1] !== _tokens.delimiters.string
        ) {
          // TODO not valid JSON missing quotes around property name
          throw new ObeliskError(
            '',
            ObeliskMethod.deserialize,
            ObeliskErrorCode.malformed,
            characterLocation
          );
        }

        referenceTypeValue.value.push({
          name: _deserializers.delimited[_tokens.delimiters.string](name).value
        });

        index =
          lastCharacterIndex +
          (text[lastCharacterIndex - 1] === _tokens.object.close ? -1 : 0);

        continue;
      }
      case _tokens.separators.referencePath: {
        const characterLocation = Object.freeze<ICharacterLocation>({
          tab,
          line,
          space
        });

        const { typeValue, lastCharacterIndex } = _lexReferencePathTypeValue(
          text,
          index,
          characterLocation
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
      default: {
        const characterLocation = Object.freeze<ICharacterLocation>({
          tab,
          line,
          space
        });

        const lexedKeyword = _lexKeywordTypeValue(text, index);

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

        switch (character) {
          case _tokens.delimiters.date:
          case _tokens.delimiters.bigInt:
          case _tokens.delimiters.string: {
            const { lastCharacterIndex, typeValue } = _lexDelimitedTypeValue(
              text,
              index,
              character,
              characterLocation
            );

            if (
              referenceTypeValue?.valueType === ValueType.object &&
              typeValue.valueType === ValueType.string
            ) {
              const lastValue =
                referenceTypeValue.value[referenceTypeValue.value.length - 1];

              if (lastValue.value) {
                referenceTypeValue.value.push({
                  name: typeValue.value
                });

                index = lastCharacterIndex;
                continue;
              }
            }

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
      const reference: unknown[] = [];
      const elements = typeValue.value;

      for (let i = 0; i < elements.length; ++i) {
        reference.push(_parse(elements[i], rootReference ?? reference));
      }

      return reference;
    }
    case ValueType.object: {
      const reference: Record<string, unknown> = {};
      const members = typeValue.value;

      for (let i = 0; i < members.length; ++i) {
        const memberValue = members[i].value;

        if (!memberValue) {
          // TODO never assigned value to property
          throw new ObeliskError(
            '',
            ObeliskMethod.deserialize,
            ObeliskErrorCode.malformed
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
      throw new ObeliskError(
        '',
        ObeliskMethod.deserialize,
        ObeliskErrorCode.malformed
      );
    }
  }
}

export const obelisk = Object.freeze({
  serialize(value: unknown) {
    return _serialize.unknown(value, _buildReferncePaths(value));
  },
  deserialize(text: string): unknown {
    const value = _parse(_lex(text));

    if (value && typeof value === 'object') {
      _resolveRefernecePaths(value as ReferenceType);
    }

    return value;
  }
});
