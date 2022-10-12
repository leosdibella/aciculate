import { EntityName, FieldType } from '@enums';
import { Entity } from '@types';
import {
  ICalendarEventModel,
  ICalendarModel,
  IOrganizationModel,
  IUserModel
} from '@interfaces';
import { BaseEntity } from './base-entity';
import { entity, field, foreignKey } from '@decorators/database';

@entity(EntityName.calendar)
export class CalendarEntity
  extends BaseEntity<ICalendarModel>
  implements Entity<ICalendarModel>
{
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
    type: FieldType.uuid,
    isNullable: true
  })
  @foreignKey({
    entityName: EntityName.user
  })
  public readonly userId?: string;

  @field({
    type: FieldType.boolean
  })
  public readonly isPrivate?: boolean;

  @field({
    type: FieldType.uuid,
    isNullable: true
  })
  public readonly organizationId?: string;

  @field({
    type: FieldType.json,
    isNullable: true
  })
  public readonly data?: Readonly<Record<string, unknown>> | null;

  public readonly organization?: Readonly<IOrganizationModel> | null;
  public readonly user?: Readonly<IUserModel> | null;
  public readonly calendarEvents: Readonly<Readonly<ICalendarEventModel>[]>;

  public constructor(model: Partial<ICalendarModel>) {
    super(model);

    this.data = model.data;
    this.title = model.title;
    this.description = model.description;
    this.organization = model.organization;
    this.user = model.user;

    this.calendarEvents =
      model.calendarEvents ?? Object.freeze<Readonly<ICalendarEventModel>>([]);
  }
}
