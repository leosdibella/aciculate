import { ICalendarEventModel } from '@interfaces';

export interface ICalendarEventService {
  get(id: string): Promise<ICalendarEventModel>;
  create(): Promise<ICalendarEventModel>;
}
