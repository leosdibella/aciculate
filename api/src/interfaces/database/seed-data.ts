import { IBaseModel } from '@interfaces/models';

export interface ISeedData<T extends IBaseModel> {
  values: Partial<T>[];
  conditions: Extract<keyof T, string>[];
  storeValues?: boolean;
}
