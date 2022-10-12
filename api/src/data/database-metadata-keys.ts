import { DatabaseMetadataKey } from '@enums';

const entity = Symbol('entity');
const field = Symbol('field');
const primaryKey = Symbol('primaryKey');
const forgienKey = Symbol('foreignKey');
const userImmutable = Symbol('userImmutable');

export const databaseMetadataKeys = Object.freeze<
  Record<DatabaseMetadataKey, symbol>
>({
  field,
  entity,
  primaryKey,
  forgienKey,
  userImmutable
});
