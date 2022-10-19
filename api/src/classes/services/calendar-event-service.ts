import { dependencyInjectionTokens } from '@data';
import { ICalendarEventService, IDatabaseContext } from '@interfaces';
import { inject } from '@shared/decorators';
import { CalendarEventEntity } from '../entities';

export class CalendarEventService implements ICalendarEventService {
  readonly #databaseContext: IDatabaseContext;

  public async get(id: string) {
    return this.#databaseContext.get(new CalendarEventEntity({ id }));
  }

  public async create() {
    // TODO
    return this.#databaseContext.insert(new CalendarEventEntity({}));
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
