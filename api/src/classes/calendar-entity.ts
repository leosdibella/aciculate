import { DbTableName } from '@shared/enums';
import { DbColumnType } from 'src/enums';
import { staticDecorator } from '../decorators';
import { ICalendarModel, IDbEntity, IDbEntityStatic } from '../interfaces';
import { BaseEntity } from './base-entity';

@staticDecorator<IDbEntityStatic<Partial<ICalendarModel>>>()
export class CalendarEntity
  extends BaseEntity
  implements IDbEntity<ICalendarModel>, Partial<ICalendarModel>
{
  public static readonly tableName = DbTableName.calendar;

  public static schema = {
    ...BaseEntity.schema,
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
    })
  };

  public static readonly immutableColumns = BaseEntity._immutableColumns;

  public static fromJson(
    json: Record<string, unknown>
  ): Partial<ICalendarModel> {
    const calendarEntity: Partial<ICalendarModel> = {};

    if (typeof json !== 'object' || !json) {
      throw Error(
        `Unable to convert JSON data into ${CalendarEntity.name}, JSON not of type object.`
      );
    }

    if (typeof json.id === 'string') {
      calendarEntity.id = json.id;
    }

    return new CalendarEntity(calendarEntity);
  }

  public data?: unknown | null;
  public title?: string;
  public description?: string | null;

  public validateInsert() {
    BaseEntity.validateInsert<ICalendarModel>(this);
  }

  public validateUpdate(oldValue: ICalendarModel) {
    BaseEntity.validateUpdate<ICalendarModel>(this, oldValue);
  }

  public toModel(): ICalendarModel {
    return BaseEntity.toModel<ICalendarModel>(this);
  }

  public toJson(): string {
    return BaseEntity.toJson<ICalendarModel>(this);
  }

  public constructor(model: Partial<ICalendarModel>) {
    super(model);

    this.data = model.data;
    this.title = model.title;
    this.description = model.description;
  }
}
