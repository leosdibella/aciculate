import { DbTableName } from '@shared/enums';
import { DbColumnType } from 'src/enums';
import { DbEntity } from 'src/types';
import { ICalendarModel } from '../interfaces';
import { BaseEntity } from './base-entity';

export class CalendarEventEntity
  extends BaseEntity
  implements DbEntity<ICalendarModel>
{
  public readonly tableName = DbTableName.calendar;

  public readonly immutableColumns: Readonly<
    Extract<keyof ICalendarModel, string>[]
  > = BaseEntity._immutableColumns;

  public data?: unknown | null;
  public title?: string;
  public description?: string | null;

  public readonly schema = {
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

  public fromJson(json: Record<string, unknown>): Partial<ICalendarModel> {
    const model = BaseEntity.fromJson<ICalendarModel>(json, this.tableName);

    return model;
  }

  public validateInsert() {
    BaseEntity.validateInsert<ICalendarModel>(this);
  }

  public validateUpdate(model: ICalendarModel) {
    BaseEntity.validateUpdate<ICalendarModel>(this, model);
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
