import { dependencyInjectionTokens } from '@data';
import { authenticate, controller, route, routeParameter } from '@decorators';
import { ControllerName } from '@enums';
import {
  ICalendarController,
  ICalendarService,
  IHttpContext,
  IUserContext
} from '@interfaces';
import { inject } from '@shared/decorators';
import { HttpVerb } from '@shared/enums';
import { notFound, ok } from '@utilities';

@controller(ControllerName.calendarController)
export class CalendarController implements ICalendarController {
  readonly #calendarService: ICalendarService;

  @authenticate()
  @route(HttpVerb.get, '/:id')
  public async selectSingle(@routeParameter() id: string) {
    try {
      const calendar = await this.#calendarService.selectSingle(id);

      return ok(calendar);
    } catch {
      // TODO: Handle generic errors too, DB availability etc
      throw notFound();
    }
  }

  public constructor(
    @inject(dependencyInjectionTokens.httpContext)
    public readonly httpContext: IHttpContext,
    @inject(dependencyInjectionTokens.userContext, true)
    public readonly userContext: Readonly<IUserContext> | undefined | null,
    @inject(dependencyInjectionTokens.calendarService)
    calendarService: ICalendarService
  ) {
    this.#calendarService = calendarService;
  }
}
