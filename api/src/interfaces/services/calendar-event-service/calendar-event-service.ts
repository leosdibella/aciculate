import { ICalendarEventModel } from '@interfaces';

export interface ICalendarEventService {
  selectSingle(id: string): Promise<ICalendarEventModel>;
  insertSingle(): Promise<ICalendarEventModel>;
}
