import { DbColumnType } from '@enums';

export interface IField {
  readonly type: DbColumnType;
  readonly defaultValue: unknown;
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly isNullable?: never;
  readonly isSecured?: true;
  validate?(value: unknown): void;
}
