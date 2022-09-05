import { IBaseModel } from './base-model';

export interface ICalendarModel extends IBaseModel {
  data: unknown | null;
  title: string;
  description: string | null;
}
