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
import { OuroborosErrorCode, OuroborosMethod, ValueType } from '../enums';
import { ReferencePathPiece, ReferenceTypeValue, TypeValue } from '../types';
import {
  deserializeString,
  getReferencePathPieceType,
  keywordTokens,
  maxKeywordTokenLength,
  numericalTokens,
  tokens,
  whiteSpaceTokens
} from './utilities';
import { OuroborosError } from '../classes';

export const referencePathPiecesSymbol = Symbol(
  'ouroboros_reference_path_pieces'
);

const deserializers = Object.freeze({
  number(
    value: string,
    characterLocation: Readonly<ICharacterLocation>
  ): INumberTypeValue {
    const number = Number(value);

    if (isNaN(number)) {
      // TODO invalid number
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed,
        characterLocation
      );
    }

    return {
      valueType: ValueType.number,
      value: number
    };
  },
  delimited: Object.freeze({
    [tokens.delimiters.bigInt](
      value: string,
      characterLocation: Readonly<ICharacterLocation>
    ): IBigIntTypeValue {
      try {
        const bigIntString = value
          .replace(tokens.delimiters.bigInt, '')
          .replace(tokens.delimiters.bigInt, '');

        const bigInt = BigInt(bigIntString);

        return {
          valueType: ValueType.bigint,
          value: bigInt
        };
      } catch {
        // TODO not a big int
        throw new OuroborosError(
          '',
          OuroborosMethod.deserialize,
          OuroborosErrorCode.malformed,
          characterLocation
        );
      }
    },
    [tokens.delimiters.date](
      value: string,
      characterLocation: Readonly<ICharacterLocation>
    ): IDateTypeValue {
      const dateString = deserializeString(
        value
          .replace(tokens.delimiters.date, '')
          .replace(tokens.delimiters.date, '')
      );

      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        // TODO invalid date
        throw new OuroborosError(
          '',
          OuroborosMethod.deserialize,
          OuroborosErrorCode.malformed,
          characterLocation
        );
      }

      return {
        valueType: ValueType.date,
        value: date
      };
    }
  }),
  keyword: Object.freeze({
    [tokens.null](): INullTypeValue {
      return {
        valueType: ValueType.null,
        value: null
      };
    },
    [tokens.undefined](): IUndefinedTypeValue {
      return {
        valueType: ValueType.undefined,
        value: undefined
      };
    },
    [tokens.boolean[0]](): IBooleanTypeValue {
      return {
        valueType: ValueType.boolean,
        value: true
      };
    },
    [tokens.boolean[1]](): IBooleanTypeValue {
      return {
        valueType: ValueType.boolean,
        value: false
      };
    },
    [tokens.number.keywords[0]](): INumberTypeValue {
      return {
        valueType: ValueType.number,
        value: Number(tokens.number.keywords[0])
      };
    },
    [tokens.number.keywords[1]](): INumberTypeValue {
      return {
        valueType: ValueType.number,
        value: Number(tokens.number.keywords[1])
      };
    },
    [tokens.number.keywords[2]](): INumberTypeValue {
      return {
        valueType: ValueType.number,
        value: Number(tokens.number.keywords[2])
      };
    }
  })
});

function appendTypeValue(
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

export function appendPrimitiveTypeValue(
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
    appendTypeValue(referenceTypeValue, typeValue);

    return lastCharacterIndex;
  } else {
    const remainingText = text.slice(lastCharacterIndex).trim();

    if (remainingText) {
      // TODO malformed json
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed,
        characterLocation
      );
    }

    return typeValue;
  }
}

function appendReferenceTypeValue(
  text: string,
  index: number,
  referenceTypeValue: ReferenceTypeValue | undefined,
  characterLocation: Readonly<ICharacterLocation>
) {
  const remainingText = text.slice(index).trim();
  let shouldContinue = false;

  if (!referenceTypeValue) {
    // TODO invalid json
    throw new OuroborosError(
      '',
      OuroborosMethod.deserialize,
      OuroborosErrorCode.malformed,
      characterLocation
    );
  }

  if (remainingText) {
    if (!referenceTypeValue.parent) {
      // TODO invalid json
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed,
        characterLocation
      );
    }

    shouldContinue = true;
  }

  if (referenceTypeValue.parent) {
    appendTypeValue(referenceTypeValue.parent, referenceTypeValue);
  }

  return {
    shouldContinue,
    nextReferenceTypeValue: shouldContinue
      ? referenceTypeValue.parent
      : referenceTypeValue?.parent ?? referenceTypeValue
  };
}

function lexKeywordTypeValue(text: string, index: number) {
  let value = '';

  for (let i = index; i < text.length; ++i) {
    value += text[i];

    if (keywordTokens.indexOf(value) > -1) {
      break;
    }

    if (i - index >= maxKeywordTokenLength) {
      break;
    }
  }

  const deserializer = deserializers.keyword[value];
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

function lexStringTypeValue(
  text: string,
  index: number,
  characterLocation: ICharacterLocation
) {
  let value = '';

  for (let i = index; i < text.length; ++i) {
    const character = text[i];

    value += character;

    if (
      character === tokens.delimiters.string &&
      i > index &&
      value[i - 1] !== tokens.characterEscape
    ) {
      break;
    }
  }

  const lastCharacterIndex = value.length + index;
  const lastCharacter = text[lastCharacterIndex - 1];

  if (lastCharacter !== tokens.delimiters.string) {
    // TODO not a valid delimited value
    throw new OuroborosError(
      '',
      OuroborosMethod.deserialize,
      OuroborosErrorCode.malformed,
      characterLocation
    );
  }

  const typeValue: IStringTypeValue = {
    valueType: ValueType.string,
    value: deserializeString(value)
  };

  return {
    typeValue,
    lastCharacterIndex
  };
}

function lexDelimitedTypeValue(
  text: string,
  index: number,
  delimiter: string,
  characterLocation: Readonly<ICharacterLocation>
) {
  const deserializer =
    deserializers.delimited[delimiter as keyof typeof deserializers.delimited];

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
    throw new OuroborosError(
      '',
      OuroborosMethod.deserialize,
      OuroborosErrorCode.malformed,
      characterLocation
    );
  }

  const typeValue = deserializer(value, characterLocation);

  return {
    typeValue,
    lastCharacterIndex
  };
}

function lexFiniteNumber(
  text: string,
  index: number,
  characterLocation: Readonly<ICharacterLocation>
) {
  let value = '';

  for (let i = index; i < text.length; ++i) {
    const character = text[i];

    if (numericalTokens.indexOf(character) === -1) {
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

  const typeValue = deserializers.number(value, characterLocation);
  const lastCharacterIndex = value.length + index;

  return {
    typeValue,
    lastCharacterIndex
  };
}

function deserializeReferencePathPiece(
  serialized: string,
  characterLocation?: ICharacterLocation
) {
  const { type, typeConfirmation } = getReferencePathPieceType(serialized);

  if (type === undefined || type !== typeConfirmation) {
    // TODO: This is impossible, it's malformed json
    throw new OuroborosError(
      '',
      OuroborosMethod.deserialize,
      OuroborosErrorCode.malformed,
      characterLocation
    );
  }

  const deserialized = deserializeString(
    serialized.slice(1, serialized.length - 1)
  );

  let value: number | string;

  if (type === ValueType.array) {
    value = +deserialized;

    if (!Number.isInteger(value) || value < 0) {
      // TODO: This is impossible, it's malformed json
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed,
        characterLocation
      );
    }
  } else {
    value = deserialized;
  }

  return {
    value,
    type
  } as ReferencePathPiece;
}

export function lexReferencePathTypeValue(
  text: string,
  index: number,
  characterLocation?: Readonly<ICharacterLocation>
) {
  let value = '';
  const values: string[] = [];

  for (let i = index; i < text.length; ++i) {
    const character = text[i];

    if (character === tokens.separators.referencePath) {
      if (value) {
        const { type, typeConfirmation } = getReferencePathPieceType(value);

        if (
          type === undefined ||
          type !== typeConfirmation ||
          value[1] !== tokens.delimiters.string ||
          value[value.length - 2] !== tokens.delimiters.string
        ) {
          // TODO invalid referencePath
          throw new OuroborosError(
            '',
            OuroborosMethod.deserialize,
            OuroborosErrorCode.malformed,
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
      character !== tokens.array.open &&
      character !== tokens.object.open
    ) {
      break;
    }

    value += character;
  }

  const lexedReferencePath = `${tokens.separators.referencePath}${values.join(
    tokens.separators.referencePath
  )}${tokens.separators.referencePath}`;

  const lastCharacterIndex = lexedReferencePath.length + index;

  if (value) {
    // TODO invalid referencePath
    throw new OuroborosError(
      '',
      OuroborosMethod.deserialize,
      OuroborosErrorCode.malformed,
      characterLocation
    );
  }

  const typeValue: IReferencePathTypeValue = {
    valueType: ValueType.referencePath,
    value: {
      [referencePathPiecesSymbol]: values
        .filter((v) => v)
        .map((v) => deserializeReferencePathPiece(v, characterLocation))
    }
  };

  return {
    typeValue,
    lastCharacterIndex
  };
}

export function lex(text: string): TypeValue {
  let referenceTypeValue: ReferenceTypeValue | undefined;
  let index = 0;
  let line = 0;
  let space = 0;
  let tab = 0;

  while (index < text.length) {
    const character = text[index];

    switch (character) {
      case tokens.whitespace.tab:
      case tokens.whitespace.space:
      case tokens.whitespace.newLine:
      case tokens.whitespace.carriageReturn: {
        switch (character) {
          case tokens.whitespace.tab:
            ++tab;
            break;
          case tokens.whitespace.space:
            ++space;
            break;
          case tokens.whitespace.newLine:
          case tokens.whitespace.carriageReturn:
            tab = 0;
            space = 0;

            if (character === tokens.whitespace.newLine) {
              ++line;
            }

            break;
          default: {
            const characterLocation = Object.freeze<ICharacterLocation>({
              tab,
              line,
              space
            });

            // TODO shouldn't be possible
            throw new OuroborosError(
              '',
              OuroborosMethod.deserialize,
              OuroborosErrorCode.bug,
              characterLocation
            );
          }
        }

        ++index;
        continue;
      }
      case tokens.separators.name:
      case tokens.separators.value: {
        ++index;
        continue;
      }
      case tokens.array.open: {
        referenceTypeValue = {
          valueType: ValueType.array,
          value: [],
          parent: referenceTypeValue
        };

        ++index;
        continue;
      }
      case tokens.object.open: {
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

          if (whiteSpaceTokens.indexOf(objectCharacter) > -1) {
            if (quotePosition === -1 || quotePosition === 1) {
              ++charactersExamined;
              continue;
            }
          }

          if (objectCharacter === tokens.delimiters.string) {
            if (quotePosition === -1) {
              quotePosition = 0;
            } else if (quotePosition === 0) {
              quotePosition = 1;
            }
          }

          if (
            objectCharacter !== tokens.separators.name &&
            objectCharacter !== tokens.object.close
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
          lastCharacter !== tokens.object.close &&
          lastCharacterIndex === text.length - 1
        ) {
          // TODO not valid JSON
          throw new OuroborosError(
            '',
            OuroborosMethod.deserialize,
            OuroborosErrorCode.malformed,
            characterLocation
          );
        }

        name = name.trim();

        if (name.length < 2 && lastCharacter !== tokens.object.close) {
          // TODO missing property name
          throw new OuroborosError(
            '',
            OuroborosMethod.deserialize,
            OuroborosErrorCode.malformed,
            characterLocation
          );
        }

        if (
          name[0] !== tokens.delimiters.string ||
          name[name.length - 1] !== tokens.delimiters.string
        ) {
          // TODO not valid JSON missing quotes around property name
          throw new OuroborosError(
            '',
            OuroborosMethod.deserialize,
            OuroborosErrorCode.malformed,
            characterLocation
          );
        }

        referenceTypeValue.value.push({
          name: deserializeString(name)
        });

        index =
          lastCharacterIndex +
          (text[lastCharacterIndex - 1] === tokens.object.close ? -1 : 0);

        continue;
      }
      case tokens.separators.referencePath: {
        const characterLocation = Object.freeze<ICharacterLocation>({
          tab,
          line,
          space
        });

        const { typeValue, lastCharacterIndex } = lexReferencePathTypeValue(
          text,
          index,
          characterLocation
        );

        const result = appendPrimitiveTypeValue(
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
      case tokens.array.close:
      case tokens.object.close: {
        ++index;

        const { shouldContinue, nextReferenceTypeValue } =
          appendReferenceTypeValue(text, index, referenceTypeValue, {
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

        const lexedKeyword = lexKeywordTypeValue(text, index);

        const keywordResult = appendPrimitiveTypeValue(
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
          case tokens.delimiters.date:
          case tokens.delimiters.bigInt: {
            const { lastCharacterIndex, typeValue } = lexDelimitedTypeValue(
              text,
              index,
              character,
              characterLocation
            );

            const result = appendPrimitiveTypeValue(
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
          case tokens.delimiters.string: {
            const { typeValue, lastCharacterIndex } = lexStringTypeValue(
              text,
              index,
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

            const result = appendPrimitiveTypeValue(
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
            const lexedFiniteNumber = lexFiniteNumber(
              text,
              index,
              characterLocation
            );

            const numberResult = appendPrimitiveTypeValue(
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
