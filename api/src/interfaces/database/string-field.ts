import { FieldType } from '@enums';
import { IField } from './field';

export interface IStringField extends IField {
  readonly type: FieldType.varchar;
  readonly maxLength: number;
  readonly minLength?: number;
  readonly isNullable?: true;
  readonly defaultValue?: string;
  validate?(value: string): void;
}
