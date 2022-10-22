import { EntityName } from '@enums';
import { EntityNameModel } from './entity-name-model';

export type EntityCache = Partial<{
  [key in EntityName]: Readonly<Readonly<EntityNameModel<key>>[]>;
}>;
