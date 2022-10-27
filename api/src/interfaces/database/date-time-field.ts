import { FieldType } from '@enums';
import { IField } from './field';

export interface IDateTimeField extends IField {
  readonly type: FieldType.timestamptz;
  readonly defaultValue?: Date;
  readonly isNullable?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  validate?(value: Date): void;
}
