import { DbColumnType, DbTableName } from '@enums';
import { IOrganizationCalendarModel } from '@interfaces/models';
import { DbEntity } from '@types';
import { BaseEntity } from './base-entity';

export class OrganizationCalendarEntity
  extends BaseEntity<IOrganizationCalendarModel>
  implements DbEntity<IOrganizationCalendarModel>
{
  public static readonly tableName = DbTableName.organizationCalendar;

  public static readonly schema = Object.freeze({
    ...BaseEntity._schema,
    calendarId: Object.freeze({
      type: DbColumnType.uuid,
      foreignKeyTable: DbTableName.calendar,
      foreignKeyColumn: 'id'
    }),
    organizationId: Object.freeze({
      type: DbColumnType.uuid,
      foreignKeyTable: DbTableName.organization,
      foreignKeyColumn: 'id'
    })
  });

  public readonly schema = OrganizationCalendarEntity.schema;
  public readonly tableName = OrganizationCalendarEntity.tableName;
  public readonly organizationId?: string;
  public readonly calendarId?: string;

  public constructor(model: Partial<IOrganizationCalendarModel>) {
    super(model);

    this.calendarId = model.calendarId;
    this.organizationId = model.organizationId;
  }
}
