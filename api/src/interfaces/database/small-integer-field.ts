import { FieldType } from '@enums';
import { IField } from './field';

export interface ISmallIntegerField extends IField {
  readonly type: FieldType.smallint;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly isNullable?: true;
  readonly defaultValue?: number;
  readonly isSecured?: true;
  validate?(value: number): void;
}
