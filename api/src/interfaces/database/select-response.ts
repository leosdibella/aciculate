import { EntityName } from '@enums/database';
import { EntityNameModel } from '@types';

export interface ISelectResponse<T extends EntityName> {
  count: number;
  results: Readonly<Readonly<EntityNameModel<T>>[]>;
}
