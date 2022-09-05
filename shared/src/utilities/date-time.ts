export const minutesPerHour = 60;
export const decimalBase = 10;

export function sanitizeDate(value?: Date | string | number): Date | undefined;
export function sanitizeDate(
  value?: Date | string | number | null
): Date | undefined | null {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    return;
  }

  const date = new Date(value);

  return isNaN(date.getTime()) ? undefined : date;
}
