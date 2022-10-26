import { FieldType } from '@enums';
import { IField } from './field';

export interface IPrimaryKeyField extends IField {
  readonly type: FieldType.uuid;
  readonly defaultValue?: never;
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly isNullable?: never;
  readonly validate?: never;
}
