import { ReferenceType } from '@all/types';
import { areShallowEqualOrderedArrays } from '@all/utilities';
import { areShallowEqual } from '@all/utilities/shallow-equal';
import { ReferenceTypeName } from 'src/enums';
import { IStackItem, ITravsersalKey } from '../interfaces';

const existingReferenceSymbol = Symbol('existing_reference');
const emptyObjectSymbol = Symbol('empty_object');
const emptyArraySymbol = Symbol('empty_array');

function traverseObject(value: ReferenceType) {
  const map = new Map<ITravsersalKey, unknown>();
  const existingReferencePathMap = new Map<ReferenceType, string[]>();

  const stack: IStackItem[] = [
    {
      path: [],
      pathTypeNames: [],
      reference: value
    }
  ];

  while (stack.length) {
    const stackItem = stack.pop()!;
    const reference = stackItem.reference;

    const referenceTypeName = Array.isArray(reference)
      ? ReferenceTypeName.array
      : ReferenceTypeName.object;

    const pathTypeNames = [...stackItem.pathTypeNames, referenceTypeName];

    let existingReferencePath = existingReferencePathMap.get(
      stackItem.reference
    );

    if (!existingReferencePath) {
      existingReferencePathMap.set(stackItem.reference, stackItem.path);
    }

    const referenceKeys = Object.keys(reference).sort();

    if (!referenceKeys.length || existingReferencePath) {
      map.set(
        {
          path: stackItem.path,
          pathTypeNames,
          existingReferencePath
        },
        existingReferencePath
          ? existingReferenceSymbol
          : referenceTypeName === ReferenceTypeName.array
          ? emptyArraySymbol
          : emptyObjectSymbol
      );

      continue;
    }

    referenceKeys.forEach((propertyName) => {
      const propertyValue = (reference as Record<string, unknown>)[
        propertyName
      ];

      const path = [...stackItem.path, propertyName];

      const isReferenceType =
        typeof propertyValue === 'object' &&
        propertyValue !== null &&
        !(propertyValue instanceof Date);

      existingReferencePath = isReferenceType
        ? existingReferencePathMap.get(propertyValue as ReferenceType)
        : undefined;

      if (isReferenceType && !existingReferencePath) {
        stack.push({
          path,
          pathTypeNames,
          reference: propertyValue as ReferenceType
        });
      } else {
        map.set(
          {
            path,
            pathTypeNames,
            existingReferencePath
          },
          existingReferencePath ? existingReferenceSymbol : propertyValue
        );
      }
    });
  }

  return map;
}

export function deepEquals(a: unknown, b: unknown) {
  if (a === b) {
    return true;
  }

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }

  const aTravered = traverseObject(a as ReferenceType);
  const bTravered = traverseObject(b as ReferenceType);

  if (aTravered.size !== bTravered.size) {
    return false;
  }

  const aKeys: ITravsersalKey[] = [];
  const bKeys: ITravsersalKey[] = [];

  for (const aKey of aTravered.keys()) {
    aKeys.push(aKey);
  }

  for (const bKey of bTravered.keys()) {
    bKeys.push(bKey);
  }

  for (let i = 0; i < aKeys.length; ++i) {
    const aKey = aKeys[i];
    const bKey = bKeys[i];

    if (!bKey) {
      return false;
    }

    if (
      !areShallowEqualOrderedArrays(aKey.pathTypeNames, bKey.pathTypeNames) ||
      !areShallowEqualOrderedArrays(aKey.path, bKey.path)
    ) {
      return false;
    }

    if (
      typeof aKey.existingReferencePath !== typeof bKey.existingReferencePath
    ) {
      return false;
    }

    if (
      aKey.existingReferencePath &&
      bKey.existingReferencePath &&
      !areShallowEqualOrderedArrays(
        aKey.existingReferencePath,
        bKey.existingReferencePath
      )
    ) {
      return false;
    }

    const aValue = aTravered.get(aKey);
    const bValue = bTravered.get(bKey);

    if (!areShallowEqual(aValue, bValue)) {
      return false;
    }
  }

  return true;
}
