import { Field } from './field';

export type EntitySchema<T> = Partial<
  Record<Extract<keyof T, string>, Readonly<Field>>
>;
