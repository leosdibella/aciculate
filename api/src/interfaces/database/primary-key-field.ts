import { DbColumnType } from '@enums';
import { IField } from './field';

export interface IPrimaryKeyField extends IField {
  readonly type: DbColumnType.uuid;
  readonly defaultValue: 'uuid_generate_v4()';
  readonly maxLength?: never;
  readonly minLength?: never;
  readonly isNullable?: never;
  readonly isSecured?: true;
  readonly validate?: never;
}
