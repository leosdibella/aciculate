import { TimeInterval } from '@shared/enums';
import { validateTimeInterval, validateTimeZone } from '@shared/utilities';
import { EntityName, FieldType } from '@enums';
import { Entity } from '@types';
import { ICalendarEventModel } from '@interfaces';
import { BaseEntity } from './base-entity';
import { entity, field, foreignKey } from '@decorators/database';

@entity(EntityName.calendarEvent)
export class CalendarEventEntity
  extends BaseEntity<ICalendarEventModel>
  implements Entity<ICalendarEventModel>
{
  readonly #startDate?: Date;
  readonly #endDate?: Date | null;

  @field({
    type: FieldType.json,
    isNullable: true
  })
  public readonly data?: Readonly<Record<string, unknown>> | null;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly title?: string;

  @field({
    type: FieldType.varchar,
    maxLength: 1024,
    isNullable: true
  })
  public readonly description?: string | null;

  @field({
    type: FieldType.boolean
  })
  public readonly isPrivate?: boolean;

  @field({
    type: FieldType.boolean
  })
  public readonly isAllDay?: boolean;

  @field({
    type: FieldType.smallint
  })
  public readonly startTime?: number;

  @field({
    type: FieldType.smallint,
    isNullable: true
  })
  public readonly endTime?: number | null;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 512,
    validate: validateTimeZone
  })
  public readonly startTimeZone?: string;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 512,
    isNullable: true,
    validate: validateTimeZone
  })
  public readonly endTimeZone?: string | null;

  @field({
    type: FieldType.smallint,
    isNullable: true
  })
  public readonly numberOfOccurences?: number | null;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 7,
    isNullable: true
  })
  public readonly repeatOn?: string | null;

  @field({
    type: FieldType.varchar,
    minLength: 1,
    maxLength: 7,
    isNullable: true,
    validate: validateTimeInterval
  })
  public readonly timeInterval?: TimeInterval | null;

  @field({
    type: FieldType.smallint,
    isNullable: true
  })
  public readonly timeIntervalDuration?: number | null;

  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.calendar
  })
  public readonly calendarId?: string;

  @field({
    type: FieldType.date
  })
  public get startDate() {
    return this.#startDate ? new Date(this.#startDate) : undefined;
  }

  @field({
    type: FieldType.date,
    isNullable: true
  })
  public get endDate() {
    return this.#endDate ? new Date(this.#endDate) : this.#endDate;
  }

  public constructor(model: Partial<ICalendarEventModel>) {
    super(model);

    this.data = model.data;
    this.title = model.title;
    this.description = model.description;
    this.isPrivate = model.isPrivate;
    this.isAllDay = model.isAllDay;
    this.#startDate = model.startDate;
    this.#endDate = model.endDate;
    this.startTime = model.startTime;
    this.endTime = model.endTime;
    this.startTimeZone = model.startTimeZone;
    this.endTimeZone = model.endTimeZone;
    this.numberOfOccurences = model.numberOfOccurences;
    this.repeatOn = model.repeatOn;
    this.timeInterval = model.timeInterval;
    this.timeIntervalDuration = model.timeIntervalDuration;
    this.calendarId = model.calendarId;
  }
}
