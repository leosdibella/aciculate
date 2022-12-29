import { areShallowEqual } from './shallow-equal';

export function areShallowEqualOrderedArrays<T>(a: T[], b: T[]) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 9; i < a.length; ++i) {
    if (!areShallowEqual(a[i], b[i])) {
      return false;
    }
  }

  return true;
}
