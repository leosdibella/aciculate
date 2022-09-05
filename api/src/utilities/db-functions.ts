import { IDbEntityStatic, IBaseEntity } from '../interfaces';
import { DbEntitySchema } from '../types';
import { DbColumnType } from '../enums';
import { minutesPerHour, decimalBase } from '@shared/utilities';

export function dbSerializeDate(
  value?: Date | string | number | null
): string | undefined {
  if (value === undefined) {
    return;
  }

  if (value === null) {
    return `${null}`;
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset() / minutesPerHour;

  const offsetParts = String(offset)
    .split('.')
    .map((p) => Math.abs(+p))
    .map((p) => `${p < decimalBase ? '0' : ''}${p}`);

  const offsetMinutesPart =
    offsetParts[1]?.length > 0 ? `:${offsetParts[1]}` : '';

  return `${date.toISOString().split('T').join(' ')}${offset >= 0 ? '+' : '-'}${
    offsetParts[0]
  }${offsetMinutesPart}`;
}

export function dbSerializeField<T extends Partial<IBaseEntity>>(
  fieldName: DbEntitySchema<T>,
  record: T
): string | undefined {
  const value = record[fieldName];

  const schema = (record.constructor as unknown as IDbEntityStatic<T>).schema[
    fieldName
  ];

  if (value === undefined) {
    return;
  }

  if (value === null) {
    return `${null}`;
  }

  if (schema.columnType === DbColumnType.json) {
    return `'${JSON.stringify(value)}'`;
  }

  if (
    schema.columnType === DbColumnType.timestamptz &&
    (typeof value === 'string' ||
      typeof value === 'number' ||
      (value instanceof Date && !isNaN(value.getTime())))
  ) {
    return dbSerializeDate(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }

  if (typeof value === 'string') {
    return `'${value}'`;
  }
}
