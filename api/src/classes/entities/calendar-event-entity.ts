import { TimeInterval } from '@shared/enums';
import { validateTimeInterval, validateTimeZone } from '@shared/utilities';
import { DbTableName, DbColumnType } from '@enums';
import { DbEntity } from '@types';
import { validateColumnValues } from '@utilities';
import { ICalendarEventModel } from '@interfaces';
import { BaseEntity } from './base-entity';

export class CalendarEventEntity
  extends BaseEntity<ICalendarEventModel>
  implements DbEntity<ICalendarEventModel>
{
  public static readonly tableName = DbTableName.calendar;

  public static readonly schema = {
    ...BaseEntity._schema,
    data: Object.freeze({
      type: DbColumnType.json,
      isNullable: true
    }),
    title: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 512
    }),
    description: Object.freeze({
      type: DbColumnType.varchar,
      maxLength: 1024,
      isNullable: true
    }),
    startDate: Object.freeze({
      type: DbColumnType.date
    }),
    startTime: Object.freeze({
      type: DbColumnType.smallint
    }),
    startTimeZone: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 512
    }),
    endTime: Object.freeze({
      type: DbColumnType.smallint,
      isNullable: true
    }),
    endDate: Object.freeze({
      type: DbColumnType.date,
      isNullable: true
    }),
    endTimeZone: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 512,
      isNullable: true
    }),
    numberOfOccurences: Object.freeze({
      type: DbColumnType.smallint,
      isNullable: true
    }),
    repeatOn: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 7,
      isNullable: true
    }),
    isAllDay: Object.freeze({
      type: DbColumnType.boolean,
      defaultValue: false
    }),
    timeInterval: Object.freeze({
      type: DbColumnType.varchar,
      minLength: 1,
      maxLength: 7,
      isNullable: true
    }),
    timeIntervalDuration: Object.freeze({
      type: DbColumnType.smallint,
      isNullable: true
    }),
    isPrivate: Object.freeze({
      type: DbColumnType.boolean,
      defaultValue: false
    }),
    calendarId: Object.freeze({
      type: DbColumnType.uuid,
      foreignKeyTable: DbTableName.calendar,
      foreignKeyColumn: 'id'
    })
  };

  private _validate() {
    if (this.timeInterval?.length) {
      validateTimeInterval(this.timeInterval);
    }

    if (this.startTimeZone?.length) {
      validateTimeZone(this.startTimeZone);
    }

    if (this.endTimeZone?.length) {
      validateTimeZone(this.endTimeZone);
    }
  }

  public readonly tableName = CalendarEventEntity.tableName;
  public readonly schema = CalendarEventEntity.schema;

  protected readonly _startDate?: Date;
  protected readonly _endDate?: Date | null;

  public readonly data?: Readonly<Record<string, unknown>> | null;
  public readonly title?: string;
  public readonly description?: string | null;
  public readonly isPrivate?: boolean;
  public readonly isAllDay?: boolean;
  public readonly startTime?: number;
  public readonly endTime?: number | null;
  public readonly startTimeZone?: string;
  public readonly endTimeZone?: string | null;
  public readonly numberOfOccurences?: number | null;
  public readonly repeatOn?: string | null;
  public readonly timeInterval?: TimeInterval | null;
  public readonly timeIntervalDuration?: number | null;
  public readonly calendarId?: string;

  public get startDate() {
    return this._startDate ? new Date(this._startDate) : this._startDate;
  }

  public get endDate() {
    return this._endDate ? new Date(this._endDate) : this._endDate;
  }

  public validateInsert() {
    validateColumnValues(this);
    this._validate();
  }

  public validateUpdate(model: ICalendarEventModel) {
    validateColumnValues(this, model);
    this._validate();
  }

  public constructor(model: Partial<ICalendarEventModel>) {
    super(model);

    this.data = model.data;
    this.title = model.title;
    this.description = model.description;
    this.isPrivate = model.isPrivate;
    this.isAllDay = model.isAllDay;
    this._startDate = model.startDate;
    this._endDate = model.endDate;
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
