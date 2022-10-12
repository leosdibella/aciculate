import {
  IBooleanField,
  IDateField,
  IDateTimeField,
  IJsonField,
  ISmallIntegerField,
  IStringField,
  IUuidField
} from '@interfaces';

export type Field =
  | IUuidField
  | IStringField
  | IJsonField
  | IDateField
  | IDateTimeField
  | ISmallIntegerField
  | IBooleanField;
