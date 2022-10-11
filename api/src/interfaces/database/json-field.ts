import { FieldType } from '@enums';
import { IField } from './field';

export interface IJsonField extends IField {
  readonly type: FieldType.json;
  readonly isNullable: true;
  readonly defaultValue?: never;
  readonly isSecured?: true;
  readonly maxLength?: never;
  readonly minLength?: never;
  validate?(value: string): void;
}
