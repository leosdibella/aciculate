import { ApiErrorCode, DbTableName } from '@shared/enums';
import { IApiError } from '@shared/interfaces';
import { DbColumnType } from 'src/enums';
import { staticDecorator } from '../decorators';
import {
  IBaseEntity,
  ICalendarEntity,
  IDbEntity,
  IDbEntityStatic
} from '../interfaces';
import { BaseEntity } from './base-entity';

@staticDecorator<IDbEntityStatic<Partial<ICalendarEntity>>>()
export class CalendarEntity
  extends BaseEntity
  implements IDbEntity<ICalendarEntity>, Partial<ICalendarEntity>
{
  public static tableName = DbTableName.calendar;

  public static schema = {
    ...BaseEntity.schema,
    data: Object.freeze({
      type: DbColumnType.json,
      isNullable: true
    }),
    title: Object.freeze({
      type: DbColumnType.varchar,
      length: 512
    }),
    description: Object.freeze({
      type: DbColumnType.varchar,
      length: 1024,
      isNullable: true
    })
  };

  public static get immutableColumns() {
    return super.immutableColumns;
  }

  public static fromJson(json: Record<string, unknown>): ICalendarEntity {
    const calendarEntity: Partial<ICalendarEntity> = {};

    if (typeof json !== 'object' || !json) {
      throw Error(
        `Unable to convert JSON data into ${CalendarEntity.name}, JSON not of type object.`
      );
    }

    if (typeof json.id === 'string') {
      calendarEntity.id = json.id;
    }

    return new CalendarEntity(calendarEntity) as ICalendarEntity;
  }

  public toModel(): Required<ICalendarEntity> {
    const baseEntity = super.toModel();
    const errors = Array.isArray(baseEntity) ? baseEntity : [];

    if (this.title === undefined) {

    }

    if (this.description === undefined) {

    }

    if (this.data === undefined) {
      
    }

    if (errors.length) {
      throw Error(errors);
    }

    return {
      ...(baseEntity as IBaseEntity),
      title: this.title!,
      description: this.description!,
      data: this.data
    };
  }

  public data?: unknown | null;
  public title?: string;
  public description?: string | null;

  public isValidInsert(): IApiError[] {
    const errors = BaseEntity.isValidInsert<Partial<ICalendarEntity>>(this);

    if (this.title === undefined || !this.title.length) {
      errors.push({
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Record of type ${this.constructor.name} has invalid value for field - title: '${this.title}', this field is required and must contain at least 1 character.`
      });
    }

    if ((this.title?.length ?? 0) > CalendarEntity.schema.title.length) {
      errors.push({
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Record of type ${this.constructor.name} has invalid value for field - title: '${this.title}', this field cannot exceed ${CalendarEntity.schema.title.length} characters.`
      });
    }

    if (
      (this.description?.length ?? 0) > CalendarEntity.schema.description.length
    ) {
      errors.push({
        errorCode: ApiErrorCode.databaseInsertError,
        message: `Record of type ${this.constructor.name} has invalid value for field - description: '${this.description}', this field cannot exceed ${CalendarEntity.schema.description.length} characters.`
      });
    }

    return errors;
  }

  public isValidUpdate(oldValue: ICalendarEntity): IApiError[] {
    const errors = BaseEntity.isValidUpdate(oldValue, this);

    return errors;
  }

  public constructor(calendarEntity: Partial<ICalendarEntity>) {
    super(calendarEntity);

    this.data = calendarEntity.data;
    this.title = calendarEntity.title;
    this.description = calendarEntity.description;
  }
}
