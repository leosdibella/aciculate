import { ICalendarEvent } from './calendar-event';
import { IDbTableBase } from './db-table-base';

export interface ICalendar extends IDbTableBase {
  title?: string;
  description?: string | null;
  data?: unknown;
  calendarEvents: ICalendarEvent[];
}
