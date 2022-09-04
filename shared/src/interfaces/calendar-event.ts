import { IDbTableBase } from './db-table-base';

export interface ICalendarEvent extends IDbTableBase {
  title?: string;
  description?: string | null;
  data?: unknown;
}
