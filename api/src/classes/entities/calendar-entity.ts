import { DbTableName, DbColumnType } from '@enums';
import { DbEntity } from '@types';
import { validateColumnValues } from '@utilities';
import {
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel
} from '@interfaces';
import { BaseEntity } from './base-entity';

export class CalendarEntity
  extends BaseEntity<ICalendarModel>
  implements DbEntity<ICalendarModel>
{
  public static readonly tableName = DbTableName.calendar;

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

  public readonly tableName = CalendarEntity.tableName;
  public readonly schema = CalendarEntity.schema;

  public readonly title?: string;
  public readonly description?: string | null;
  public readonly userId?: string;
  public readonly isPrivate?: boolean;
  public readonly organizationId?: string;
  public readonly data?: Readonly<Record<string, unknown>> | null;
  public readonly organization?: Readonly<IOrganizationModel> | null;
  public readonly user?: Readonly<IUserModel> | null;
  public readonly calendarEvents: Readonly<Readonly<ICalendarEventModel[]>>;

  public validateInsert() {
    validateColumnValues(this);
  }

  public validateUpdate(model: ICalendarModel) {
    validateColumnValues(this, model);
  }

  public constructor(model: Partial<ICalendarModel>) {
    super(model);

    this.data = model.data;
    this.title = model.title;
    this.description = model.description;
    this.calendarEvents = model.calendarEvents ?? [];
    this.organization = model.organization;
    this.user = model.user;
  }
}
