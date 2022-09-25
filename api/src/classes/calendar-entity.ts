import { DbTableName, DbColumnType } from '../enums';
import { DbEntity } from '../types';
import { validateColumnValues } from '../utilities';
import {
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel
} from '../interfaces';
import { BaseEntity } from './base-entity';

export class CalendarEntity
  extends BaseEntity<ICalendarModel>
  implements DbEntity<ICalendarModel>
{
  public static readonly schema = Object.freeze({
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
    userId: Object.freeze({
      type: DbColumnType.uuid,
      isNullable: true,
      foreignKeyTable: DbTableName.user,
      foreignKeyColumn: 'id'
    }),
    organizationId: Object.freeze({
      type: DbColumnType.uuid,
      isNullable: true,
      foreignKeyTable: DbTableName.organization,
      foreignKeyColumn: 'id'
    }),
    isPrivate: Object.freeze({
      type: DbColumnType.boolean,
      defaultValue: false
    }),
    organization: 'organizationId',
    user: 'userId',
    calendarEvents: Object.freeze([])
  });

  protected readonly _data?: unknown | null;
  protected readonly _organization?: IOrganizationModel | null;
  protected readonly _user: IUserModel | null = null;
  protected readonly _calendarEvents: ICalendarEventModel[] = [];

  public readonly title?: string;
  public readonly description?: string | null;
  public readonly userId?: string;
  public readonly isPrivate?: boolean;
  public readonly organizationId?: string;

  public get data() {
    return this._data;
  }

  public get organization() {
    return this._organization;
  }

  public get user() {
    return this._user;
  }

  public get calendarEvents() {
    return this._calendarEvents;
  }

  public readonly tableName = DbTableName.calendar;
  public readonly schema = CalendarEntity.schema;

  public validateInsert() {
    validateColumnValues(this);
  }

  public validateUpdate(model: ICalendarModel) {
    validateColumnValues(this, model);
  }

  public constructor(model: Partial<ICalendarModel>) {
    super(model);

    this._data = model.data;
    this.title = model.title;
    this.description = model.description;
  }
}
