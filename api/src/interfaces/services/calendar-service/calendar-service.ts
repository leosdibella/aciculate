import { ICalendarModel } from '@interfaces';

export interface ICalendarService {
  selectSingle(id: string): Promise<ICalendarModel>;
}
