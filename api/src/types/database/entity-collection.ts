import { EntityName } from '@enums';
import { IEntityConstructor } from '@interfaces';
import { EntityNameModel } from './entity-name-model';

export type Entities = Readonly<{
  [key in EntityName]: IEntityConstructor<EntityNameModel<key>>;
}>;
