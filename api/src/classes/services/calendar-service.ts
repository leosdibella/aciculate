import { dependencyInjectionTokens } from '@data';
import { EntityName } from '@enums/database';
import { ICalendarService, IDatabaseContext } from '@interfaces';
import { inject } from '@shared/decorators';

export class CalendarService implements ICalendarService {
  readonly #databaseContext: IDatabaseContext;

  public async selectSingle(id: string) {
    return this.#databaseContext.selectSingle(EntityName.calendar, id);
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
