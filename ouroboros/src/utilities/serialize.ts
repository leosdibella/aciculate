import { ReferenceType } from '../types';
import { OuroborosError } from '../classes';
import { OuroborosErrorCode, OuroborosMethod, ValueType } from '../enums';
import {
  isReferenceType,
  rootReferencePath,
  serializeDate,
  serializeString,
  tokens,
  valueTypePathReferenceWrappers
} from './utilities';
import { IReferenceLocation } from '../interfaces';

function createReferenceTypeStack(partiallySerialized: ReferenceType) {
  const visitedReferenceMap = new Map<ReferenceType, true>();

  const stack: {
    path: string[];
    value: ReferenceType;
  }[] = [
    {
      path: [],
      value: partiallySerialized as ReferenceType
    }
  ];

  let index = 0;

  while (index < stack.length) {
    const stackItem = stack[index];
    const stackItemValue = stackItem.value;
    const referenceKeys = Object.keys(stackItemValue);

    referenceKeys.forEach((key) => {
      const propertyValue = stackItemValue[key as keyof typeof stackItemValue];

      if (isReferenceType(propertyValue)) {
        const visited = visitedReferenceMap.get(propertyValue as ReferenceType);

        if (!visited) {
          stack.push({
            path: [...stackItem.path, key],
            value: propertyValue as ReferenceType
          });
        }
      }
    });

    ++index;
  }

  return stack;
}

function serializeReferenceType(partiallySerialized: ReferenceType) {
  const stack = createReferenceTypeStack(partiallySerialized);

  while (stack.length) {
    const stackItem = stack.pop()!;
    let serializedReference: string;
    let parentReference = partiallySerialized;

    for (let i = 0; i < stackItem.path.length - 1; ++i) {
      parentReference = parentReference[
        stackItem.path[i] as keyof typeof parentReference
      ] as ReferenceType;
    }

    const reference =
      parentReference[
        stackItem.path[
          stackItem.path.length - 1
        ] as keyof typeof parentReference
      ] ?? partiallySerialized;

    if (Array.isArray(reference)) {
      serializedReference = `${tokens.array.open}${reference.join()}${
        tokens.array.close
      }`;
    } else {
      serializedReference = `${tokens.object.open}${Object.keys(reference).map(
        (key) =>
          `${serializeString(key)}:${reference[key as keyof typeof reference]}`
      )}${tokens.object.close}`;
    }

    if (reference === partiallySerialized) {
      return serializedReference;
    } else {
      (parentReference[
        stackItem.path[
          stackItem.path.length - 1
        ] as keyof typeof parentReference
      ] as string) = serializedReference;
    }
  }

  throw new OuroborosError(
    'An error occured while serializing a reference type',
    OuroborosMethod.serialize,
    OuroborosErrorCode.bug
  );
}

const serializers = Object.freeze({
  bigint: (value: bigint) =>
    `${tokens.delimiters.bigInt}${value}${tokens.delimiters.bigInt}`,
  string: serializeString,
  number: (value: number) => `${value}`,
  symbol: () => undefined,
  function: () => undefined,
  undefined: () => tokens.undefined,
  boolean: (value: boolean) => `${value}`,
  date(value: Date, location?: string) {
    const time = value.getTime();

    if (isNaN(time)) {
      const errorPath = location ? ` at location: ${location}` : '';

      throw new OuroborosError(
        `invalid date${errorPath}`,
        OuroborosMethod.serialize,
        OuroborosErrorCode.invalidDate
      );
    }

    const jsonSerializedDate = serializeDate(value);

    return `${tokens.delimiters.date}${jsonSerializedDate}${tokens.delimiters.date}`;
  },
  object(
    value: ReferenceType,
    referencePaths: Map<ReferenceType, IReferenceLocation>
  ) {
    // Everything in this object is serialized or is a reference type
    const partiallySerialized: ReferenceType = Array.isArray(value) ? [] : {};

    const stack: {
      path: string[];
      value: ReferenceType;
    }[] = [
      {
        path: [],
        value: value as ReferenceType
      }
    ];

    while (stack.length) {
      const keyValuePair = stack.pop()!;

      Object.keys(keyValuePair.value).forEach((key) => {
        const nextValue =
          keyValuePair.value[key as keyof typeof keyValuePair.value];

        const referencePath = referencePaths.get(nextValue as ReferenceType);
        let partiallySerializedReference = partiallySerialized;

        for (let i = 0; i < keyValuePair.path.length; ++i) {
          (partiallySerializedReference as unknown) =
            partiallySerializedReference[
              keyValuePair.path[i] as keyof typeof partiallySerializedReference
            ];
        }

        if (referencePath) {
          const extendedPath = [...keyValuePair.path, key];

          if (referencePath.path.join() === extendedPath.join()) {
            (partiallySerializedReference[
              key as keyof typeof partiallySerializedReference
            ] as ReferenceType) = Array.isArray(nextValue) ? [] : {};

            stack.push({
              path: extendedPath,
              value: nextValue as ReferenceType
            });
          } else {
            (partiallySerializedReference[
              key as keyof typeof partiallySerializedReference
            ] as string) = referencePath.location;
          }
        } else {
          const type = typeof nextValue;
          let serializedValue: string | undefined;

          if (nextValue === null) {
            serializedValue = tokens.null;
          } else if (nextValue instanceof Date) {
            serializedValue = serializers.date(nextValue);
          } else {
            const serializer = serializers[type] as (
              value: unknown
            ) => string | undefined;

            serializedValue = serializer(nextValue);
          }

          if (serializedValue !== undefined) {
            (partiallySerializedReference[
              key as keyof typeof partiallySerializedReference
            ] as string) = serializedValue;
          }
        }
      });
    }

    return serializeReferenceType(partiallySerialized);
  }
});

function extendReferencePath(
  referencePath: string,
  value: string,
  valueType: ValueType.object | ValueType.array
) {
  const wrappers = valueTypePathReferenceWrappers[valueType];

  if (referencePath === rootReferencePath) {
    return `${tokens.separators.referencePath}${
      wrappers[0]
    }${serializers.string(value)}${wrappers[1]}${
      tokens.separators.referencePath
    }`;
  }

  return `${referencePath}${wrappers[0]}${serializers.string(value)}${
    wrappers[1]
  }${tokens.separators.referencePath}`;
}

function buildReferncePaths(value: unknown) {
  const referencePaths = new Map<ReferenceType, IReferenceLocation>();

  if (!isReferenceType(value)) {
    return referencePaths;
  }

  const stack: { key: string; value: ReferenceType; path: string[] }[] = [
    {
      key: rootReferencePath,
      value: value as ReferenceType,
      path: []
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
      path: keyValuePair.path
    });

    // Note the keys need to be reveresed so they are plucked from the stack in alpha/numerical order
    // this preserves order as they are ordered by first appearance, and traversed by first appearance
    // when deserialized into actual references.
    const valueType = Array.isArray(keyValuePair.value)
      ? ValueType.array
      : ValueType.object;

    Object.keys(keyValuePair.value)
      .reverse()
      .forEach((propertyName) => {
        const propertyValue = (keyValuePair.value as Record<string, unknown>)[
          propertyName
        ];

        if (isReferenceType(propertyValue)) {
          stack.push({
            key: extendReferencePath(keyValuePair.key, propertyName, valueType),
            value: propertyValue as ReferenceType,
            path: [...keyValuePair.path, propertyName]
          });
        }
      });
  }

  return referencePaths;
}

export function serialize(value: unknown) {
  const referencePaths = buildReferncePaths(value);
  const type = typeof value;

  if (value === null) {
    return tokens.null;
  }

  if (value instanceof Date) {
    return serializers.date(value);
  }

  const serializer = serializers[type] as (
    value: unknown,
    referencePaths: Map<ReferenceType, IReferenceLocation>
  ) => string | undefined;

  return serializer(value, referencePaths);
}
