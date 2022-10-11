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
import { entity, field, foreignKey } from '@decorators/database';

@entity()
export class CalendarEntity
  extends BaseEntity<ICalendarModel>
  implements DbEntity<ICalendarModel>
{
  @field({
    type: DbColumnType.varchar,
    minLength: 1,
    maxLength: 512
  })
  public readonly title?: string;

  @field({
    type: DbColumnType.varchar,
    maxLength: 1024,
    isNullable: true
  })
  public readonly description?: string | null;

  @field({
    type: DbColumnType.uuid,
    isNullable: true
  })
  @foreignKey({
    tableName: DbTableName.user
  })
  public readonly userId?: string;

  @field({
    type: DbColumnType.boolean
  })
  public readonly isPrivate?: boolean;

  @field({
    type: DbColumnType.uuid,
    isNullable: true
  })
  public readonly organizationId?: string;

  @field({
    type: DbColumnType.json,
    isNullable: true
  })
  public readonly data?: Readonly<Record<string, unknown>> | null;

  public readonly organization?: Readonly<IOrganizationModel> | null;
  public readonly user?: Readonly<IUserModel> | null;
  public readonly calendarEvents: Readonly<Readonly<ICalendarEventModel>[]>;

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
    this.calendarEvents = model.calendarEvents ?? Object.freeze([]);
    this.organization = model.organization;
    this.user = model.user;
  }
}
