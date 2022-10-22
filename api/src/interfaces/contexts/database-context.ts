import { EntityNameModel } from '@types';
import { ISelectParameters, ISelectResponse } from '../database';
import { EntityName } from '@enums/database';

export interface IDatabaseContext {
  selectSingle<T extends EntityName>(
    entityName: T,
    id: string
  ): Promise<EntityNameModel<T>>;
  selectMany<T extends EntityName>(
    parameters: ISelectParameters<T>
  ): Promise<ISelectResponse<T>>;
  insertSingle<T extends EntityName>(
    entityName: T,
    model: Partial<EntityNameModel<T>>
  ): Promise<EntityNameModel<T>>;
  updateSingle<T extends EntityName>(
    entityName: T,
    model: Partial<EntityNameModel<T>>
  ): Promise<EntityNameModel<T>>;
  deleteSingle<T extends EntityName>(
    entityName: T,
    id: string,
    hard?: boolean
  ): Promise<void>;
  migrate(): Promise<void>;
}
