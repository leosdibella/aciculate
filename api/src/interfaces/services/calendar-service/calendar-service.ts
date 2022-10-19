import { ICalendarModel } from '@interfaces';

export interface ICalendarService {
  get(id: string): Promise<ICalendarModel>;
}
