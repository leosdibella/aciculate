import { FieldType } from '@enums';
import { IField } from './field';

export interface IDateField extends IField {
  readonly type: FieldType.date;
  readonly defaultValue?: string;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  validate?(value: Date): void;
}
