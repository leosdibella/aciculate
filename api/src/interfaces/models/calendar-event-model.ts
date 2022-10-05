import { TimeInterval } from '@shared/enums';
import { IBaseModel } from './base-model';

export interface ICalendarEventModel extends IBaseModel {
  readonly data: Readonly<Record<string, unknown>> | null;
  readonly title: string;
  readonly description: string | null;
  readonly startDate: Date;
  readonly startTime: number;
  readonly startTimeZone: string;
  readonly endTime: number | null;
  readonly endDate: Date | null;
  readonly endTimeZone: string | null;
  readonly numberOfOccurences: number | null;
  readonly repeatOn: string | null;
  readonly isAllDay: boolean;
  readonly timeInterval: TimeInterval | null;
  readonly timeIntervalDuration: number | null;
  readonly isPrivate: boolean;
  readonly calendarId: string;
}
