import { TimeInterval } from '@shared/enums';
import { IBaseModel } from './base-model';

export interface ICalendarEventModel extends IBaseModel {
  data: unknown | null;
  title: string;
  description: string | null;
  startDate: Date;
  startTime: number;
  startTimeZone: string;
  endTime: number | null;
  endDate: Date | null;
  endTimeZone: string | null;
  numberOfOccurences: number | null;
  repeatOn: string | null;
  isAllDay: boolean;
  timeInterval: TimeInterval | null;
  timeIntervalDuration: number | null;
  isPrivate: boolean;
  calendarId: string;
}
