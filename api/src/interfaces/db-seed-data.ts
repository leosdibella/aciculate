import { IBaseModel } from './base-model';

export interface IDbSeedData<T extends IBaseModel> {
  values: Partial<T>[];
  conditions: Extract<keyof T, string>[];
}
