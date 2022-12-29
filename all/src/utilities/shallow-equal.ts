export function areShallowEqual(a: unknown, b: unknown) {
  if (a === b) {
    return true;
  }

  if (
    typeof a === 'object' &&
    typeof b === 'object' &&
    a instanceof Date &&
    b instanceof Date
  ) {
    return a.getTime() === b.getTime();
  }

  return false;
}
