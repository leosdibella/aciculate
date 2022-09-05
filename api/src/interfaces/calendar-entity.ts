import { IBaseEntity } from './base-entity';

export interface ICalendarEntity extends IBaseEntity {
  data: unknown | null;
  title: string;
  description: string | null;
}
