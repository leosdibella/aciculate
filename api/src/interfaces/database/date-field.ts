import { FieldType } from '@enums';
import { IField } from './field';

export interface IDateField extends IField {
  readonly type: FieldType.date;
  readonly defaultValue?: Date;
  readonly isNullable?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  validate?(value: Date): void;
}
