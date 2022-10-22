import { IHttpResponse } from '../utilities';
import { ICalendarEventModel } from '../models';
import { IController } from './controller';

export interface ICalendarEventController extends IController {
  selectSingle(id: string): Promise<IHttpResponse<ICalendarEventModel>>;
  insertSingle(): Promise<IHttpResponse<ICalendarEventModel>>;
}
