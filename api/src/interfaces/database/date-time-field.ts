import { FieldType } from '@enums';
import { IField } from './field';

export interface IDateTimeField extends IField {
  readonly type: FieldType.timestamptz;
  readonly defaultValue?: string;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  validate?(value: Date): void;
}
