import { entity, field, foreignKey } from '@decorators/database';
import { FieldType, EntityName } from '@enums';
import { IOrganizationCalendarModel } from '@interfaces/models';
import { Entity } from '@types';
import { BaseEntity } from './base-entity';

@entity(EntityName.organizationCalendar)
export class OrganizationCalendarEntity
  extends BaseEntity<IOrganizationCalendarModel>
  implements Entity<IOrganizationCalendarModel>
{
  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.calendar
  })
  public readonly organizationId?: string;

  @field({
    type: FieldType.uuid
  })
  @foreignKey({
    entityName: EntityName.calendar
  })
  public readonly calendarId?: string;

  public constructor(model: Partial<IOrganizationCalendarModel>) {
    super(model);

    this.calendarId = model.calendarId;
    this.organizationId = model.organizationId;
  }
}
