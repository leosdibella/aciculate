import { OuroborosError } from '../classes';
import { OuroborosErrorCode, OuroborosMethod, ValueType } from '../enums';
import { ReferencePathPiece, ReferenceType, TypeValue } from '../types';
import {
  lex,
  lexReferencePathTypeValue,
  referencePathPiecesSymbol
} from './lexer';
import {
  isReferenceType,
  isValidReferencePoint,
  rootReferencePath,
  serializeString,
  tokens,
  valueTypePathReferenceWrappers
} from './utilities';

function resolveReference(
  reference: ReferenceType,
  referencePathPieces: ReferencePathPiece[]
) {
  const reveresedReferencePathPieces = [...referencePathPieces].reverse();
  let resolvedReference = reference;

  while (reveresedReferencePathPieces.length) {
    const referencePathPiece = reveresedReferencePathPieces.pop()!;

    if (isValidReferencePoint(resolvedReference, referencePathPiece)) {
      resolvedReference = resolvedReference[
        referencePathPiece.value as keyof typeof resolvedReference
      ] as ReferenceType;
    } else {
      // TODO invalid referencePath
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed
      );
    }

    if (!resolvedReference || typeof resolvedReference !== 'object') {
      // TODO invalid referencePath
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed
      );
    }
  }

  return resolvedReference;
}

function replaceSymbolicReferences(
  value: ReferenceType,
  referencePathLocations: Record<string, ReferencePathPiece[]>
) {
  Object.keys(referencePathLocations).forEach((referencePathLocation) => {
    const referencePathPieces = referencePathLocations[referencePathLocation];

    const locationPathPieces = lexReferencePathTypeValue(
      referencePathLocation,
      0
    ).typeValue.value[referencePathPiecesSymbol].reverse();

    let reference = value;

    while (locationPathPieces.length - 1 > 0) {
      const locationPathPiece = locationPathPieces.pop()!;

      if (isValidReferencePoint(reference, locationPathPiece)) {
        reference = reference[
          locationPathPiece.value as keyof typeof reference
        ] as ReferenceType;
      } else {
        // TODO invalid referencePath
        throw new OuroborosError(
          '',
          OuroborosMethod.deserialize,
          OuroborosErrorCode.malformed
        );
      }

      if (!reference || typeof reference !== 'object') {
        // TODO invalid referencePath
        throw new OuroborosError(
          '',
          OuroborosMethod.deserialize,
          OuroborosErrorCode.malformed
        );
      }
    }

    const lastLocationPathPiece = locationPathPieces.pop()!;

    if (!isValidReferencePoint) {
      // TODO invalid referencePath
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed
      );
    }

    const referencedSymbolLocation = reference[
      lastLocationPathPiece.value as keyof typeof reference
    ] as Record<symbol, ReferencePathPiece[]>;

    if (
      typeof referencedSymbolLocation !== 'object' ||
      referencedSymbolLocation[referencePathPiecesSymbol] !==
        referencePathPieces
    ) {
      // TODO invalid referencePath
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed
      );
    }

    const resolvedReferense = resolveReference(value, referencePathPieces);

    (reference[
      lastLocationPathPiece.value as keyof typeof reference
    ] as ReferenceType) = resolvedReferense;
  });
}

function extendReferencePath(
  referencePath: string,
  value: string,
  valueType: ValueType.object | ValueType.array
) {
  const wrappers = valueTypePathReferenceWrappers[valueType];

  if (referencePath === rootReferencePath) {
    return `${tokens.separators.referencePath}${wrappers[0]}${serializeString(
      value
    )}${wrappers[1]}${tokens.separators.referencePath}`;
  }

  return `${referencePath}${wrappers[0]}${serializeString(value)}${
    wrappers[1]
  }${tokens.separators.referencePath}`;
}

function resolveRefernecePaths(value: ReferenceType) {
  const stack: { key: string; value: ReferenceType }[] = [
    {
      key: rootReferencePath,
      value
    }
  ];

  const referencePathLocations: Record<string, ReferencePathPiece[]> = {};

  while (stack.length) {
    const keyValuePair = stack.pop()!;

    const valueType = Array.isArray(keyValuePair.value)
      ? ValueType.array
      : ValueType.object;

    Object.keys(keyValuePair.value).forEach((propertyName) => {
      const propertyValue = (keyValuePair.value as Record<string, unknown>)[
        propertyName
      ];

      if (isReferenceType(propertyValue)) {
        const symbols = Object.getOwnPropertySymbols(propertyValue);

        if (symbols[0] === referencePathPiecesSymbol) {
          referencePathLocations[
            extendReferencePath(keyValuePair.key, propertyName, valueType)
          ] = (propertyValue as Record<symbol, ReferencePathPiece[]>)[
            referencePathPiecesSymbol
          ];
        } else {
          stack.push({
            key: extendReferencePath(keyValuePair.key, propertyName, valueType),
            value: propertyValue as ReferenceType
          });
        }
      }
    });
  }

  replaceSymbolicReferences(value, referencePathLocations);
}

function parse(typeValue: TypeValue, rootReference?: ReferenceType): unknown {
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
        reference.push(parse(elements[i], rootReference ?? reference));
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
          throw new OuroborosError(
            '',
            OuroborosMethod.deserialize,
            OuroborosErrorCode.malformed
          );
        }

        reference[members[i].name] = parse(
          memberValue,
          rootReference ?? reference
        );
      }

      return reference;
    }
    default: {
      // TODO something went horribly wrong
      throw new OuroborosError(
        '',
        OuroborosMethod.deserialize,
        OuroborosErrorCode.malformed
      );
    }
  }
}

export function deserialize(text: string): unknown {
  const lexed = lex(text);
  const parsed = parse(lexed);

  if (parsed && typeof parsed === 'object') {
    resolveRefernecePaths(parsed as ReferenceType);
  }

  return parsed;
}
