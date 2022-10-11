import { entity, field, foreignKey } from '@decorators/database';
import { DbColumnType, DbTableName } from '@enums';
import { IOrganizationCalendarModel } from '@interfaces/models';
import { DbEntity } from '@types';
import { BaseEntity } from './base-entity';

@entity()
export class OrganizationCalendarEntity
  extends BaseEntity<IOrganizationCalendarModel>
  implements DbEntity<IOrganizationCalendarModel>
{
  @field({
    type: DbColumnType.uuid
  })
  @foreignKey({
    tableName: DbTableName.calendar
  })
  public readonly organizationId?: string;

  @field({
    type: DbColumnType.uuid
  })
  @foreignKey({
    tableName: DbTableName.calendar
  })
  public readonly calendarId?: string;

  public constructor(model: Partial<IOrganizationCalendarModel>) {
    super(model);

    this.calendarId = model.calendarId;
    this.organizationId = model.organizationId;
  }
}
