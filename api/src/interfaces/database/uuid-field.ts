import { FieldType } from '@enums';
import { IField } from './field';

export interface IUuidField extends IField {
  readonly type: FieldType.uuid;
  readonly defaultValue?: 'uuid_generate_v4()';
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly isNullable?: true;
  readonly validate?: never;
}
