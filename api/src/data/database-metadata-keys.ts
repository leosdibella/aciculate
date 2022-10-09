const entity = Symbol('entity');
const field = Symbol('field');
const primaryKey = Symbol('primaryKey');
const forgienKey = Symbol('foreignKey');
const userImmutable = Symbol('userImmutable');

export const databaseMetadataKeys = Object.freeze({
  field,
  entity,
  primaryKey,
  forgienKey,
  userImmutable
});
