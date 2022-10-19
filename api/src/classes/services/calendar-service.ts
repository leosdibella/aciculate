import { dependencyInjectionTokens } from '@data';
import { ICalendarService, IDatabaseContext } from '@interfaces';
import { inject } from '@shared/decorators';
import { CalendarEntity } from '../entities';

export class CalendarService implements ICalendarService {
  readonly #databaseContext: IDatabaseContext;

  public async get(id: string) {
    return this.#databaseContext.get(new CalendarEntity({ id }));
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
