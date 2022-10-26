import { FieldType } from '@enums';
import { IField } from './field';

export interface IBooleanField extends IField {
  readonly type: FieldType.boolean;
  readonly defaultValue?: boolean;
  readonly isNullable?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly validate?: never;
}
