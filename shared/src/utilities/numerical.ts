export function isInteger(value: number) {
  return (value | 0) === 0;
}

export function isPositiveInteger(value: number) {
  return isInteger(value) && value > 0;
}
