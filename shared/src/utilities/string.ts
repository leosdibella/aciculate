export function toCamelCase(value: string): string {
  if (!value) {
    return '';
  }

  return `${value[0].toLocaleLowerCase()}${value.slice(1)}`;
}
