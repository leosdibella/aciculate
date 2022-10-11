import { FieldType } from '@enums';
import { IField } from './field';

export interface IUuidField extends IField {
  readonly type: FieldType.uuid;
  readonly defaultValue?: never;
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly isNullable?: true;
  readonly isSecured?: true;
  readonly validate?: never;
}
