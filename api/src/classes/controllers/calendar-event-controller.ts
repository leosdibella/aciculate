import { dependencyInjectionTokens } from '@data';
import { authenticate, controller, route, routeParameter } from '@decorators';
import { ControllerName } from '@enums';
import {
  ICalendarEventController,
  ICalendarEventService,
  IHttpContext,
  IUserContext
} from '@interfaces';
import { inject } from '@shared/decorators';
import { HttpVerb } from '@shared/enums';
import { notFound, ok } from '@utilities';

@controller(ControllerName.calendarEventController)
export class CalendarEventController implements ICalendarEventController {
  readonly #calendarEventService: ICalendarEventService;

  @authenticate()
  @route(HttpVerb.get, '/:id')
  public async selectSingle(@routeParameter('id') id: string) {
    try {
      const calendarEvent = await this.#calendarEventService.selectSingle(id);

      return ok(calendarEvent);
    } catch {
      // TODO: Handle generic errors too, DB availability etc
      throw notFound();
    }
  }

  @authenticate()
  @route(HttpVerb.post)
  public async insertSingle() {
    try {
      const calendarEvent = await this.#calendarEventService.insertSingle();

      return ok(calendarEvent);
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
    @inject(dependencyInjectionTokens.calendarEventService)
    calendarEventService: ICalendarEventService
  ) {
    this.#calendarEventService = calendarEventService;
  }
}
