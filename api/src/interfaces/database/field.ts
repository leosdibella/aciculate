import { FieldType } from '@enums';

export interface IField {
  readonly type: FieldType;
  readonly defaultValue?: unknown;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly isNullable?: true;
  validate?(value: unknown): void;
}
