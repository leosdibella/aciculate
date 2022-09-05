import { IBaseEntity } from './base-entity';
import { IApiError } from '@shared/interfaces';

export interface IDbEntity<T extends Partial<IBaseEntity>> {
  isValidInsert(): IApiError[];
  isValidUpdate(oldValue: Required<T>): IApiError[];
  toModel(): Required<T>;
}
