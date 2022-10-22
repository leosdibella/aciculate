import { dependencyInjectionTokens } from '@data';
import { EntityName } from '@enums/database';
import { ICalendarEventService, IDatabaseContext } from '@interfaces';
import { inject } from '@shared/decorators';

export class CalendarEventService implements ICalendarEventService {
  readonly #databaseContext: IDatabaseContext;

  public async selectSingle(id: string) {
    return this.#databaseContext.selectSingle(EntityName.calendarEvent, id);
  }

  public async insertSingle() {
    // TODO
    return this.#databaseContext.insertSingle(EntityName.calendarEvent, {});
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
