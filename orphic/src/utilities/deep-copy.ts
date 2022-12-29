import { ReferenceType } from '@all/types';
import { IStackItem } from '../interfaces';

export function deepCopy<T>(value: T) {
  if (typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value === null) {
    return null;
  }

  const rootReference: ReferenceType = Array.isArray(value) ? [] : {};
  const existingReferenceMap = new Map<ReferenceType, ReferenceType>();

  const stack: IStackItem[] = [
    {
      path: [],
      reference: value as ReferenceType,
      pathTypeNames: []
    }
  ];

  while (stack.length) {
    const stackItem = stack.pop()!;
    const reference = stackItem.reference;
    const existingReference = existingReferenceMap.get(reference);

    const newReference = !stackItem.path.length
      ? rootReference
      : Array.isArray(reference)
      ? []
      : {};

    const parentReference = existingReference ?? newReference;

    if (!existingReference) {
      existingReferenceMap.set(reference, newReference);
    }

    if (stackItem.path.length) {
      let settingReference = rootReference;

      for (let i = 0; i < stackItem.path.length - 1; ++i) {
        settingReference = (settingReference as Record<string, unknown>)[
          stackItem.path[i]
        ] as ReferenceType;
      }

      (settingReference as Record<string, unknown>)[
        stackItem.path[stackItem.path.length - 1]
      ] = parentReference;
    }

    if (existingReference) {
      continue;
    }

    Object.keys(reference).forEach((propertyName) => {
      const propertyValue = (reference as Record<string, unknown>)[
        propertyName
      ];

      const path = [...stackItem.path, propertyName];

      const isReferenceType =
        typeof propertyValue === 'object' &&
        propertyValue !== null &&
        !(propertyValue instanceof Date);

      const existingChildReference = isReferenceType
        ? existingReferenceMap.get(propertyValue as ReferenceType)
        : undefined;

      if (isReferenceType && !existingChildReference) {
        stack.push({
          path,
          pathTypeNames: [],
          reference: propertyValue as ReferenceType
        });
      } else if (existingChildReference) {
        (parentReference as Record<string, unknown>)[propertyName] =
          existingChildReference;
      } else if (propertyValue instanceof Date) {
        (parentReference as Record<string, unknown>)[propertyName] = new Date(
          propertyValue.getTime()
        );
      } else {
        (parentReference as Record<string, unknown>)[propertyName] =
          propertyValue;
      }
    });
  }

  return rootReference as T;
}
