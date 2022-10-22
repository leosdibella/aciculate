import { IHttpResponse } from '../utilities';
import { ICalendarModel } from '../models';
import { IController } from './controller';

export interface ICalendarController extends IController {
  selectSingle(id: string): Promise<IHttpResponse<ICalendarModel>>;
}
