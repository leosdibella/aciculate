import { IHttpResponse } from '../utilities';
import { ICalendarEventModel } from '../models';
import { IController } from './controller';

export interface ICalendarEventController extends IController {
  get(id: string): Promise<IHttpResponse<ICalendarEventModel>>;
  create(): Promise<IHttpResponse<ICalendarEventModel>>;
}
