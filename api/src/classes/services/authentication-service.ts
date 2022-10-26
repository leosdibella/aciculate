import { dependencyInjectionTokens } from '@data';
import { EntityName } from '@enums/database';
import { IAuthenticationService, IDatabaseContext } from '@interfaces';
import { ApiError } from '@shared/classes';
import { inject } from '@shared/decorators';
import { generateHash, generateToken } from '@utilities';
import { randomUUID } from 'crypto';

export class AuthenticationService implements IAuthenticationService {
  readonly #databaseContext: IDatabaseContext;

  public async authenticate(rusername: string, password: string) {
    const user = (
      await this.#databaseContext.selectMany({
        entityName: EntityName.user,
        take: 1
      })
    ).results[0];

    const userPassword = (
      await this.#databaseContext.selectMany({
        entityName: EntityName.userPassword,
        take: 1
      })
    ).results[0];

    const hashedPassword = await generateHash(password, userPassword.salt);

    if (hashedPassword !== userPassword.hash) {
      // TODO
      throw new ApiError([]);
    }

    const updatedUserPassword = await this.#databaseContext.updateSingle(
      EntityName.userPassword, {
        tokenSecret: randomUUID()
      }
    );

    const token = generateToken(
      {
        userId: user.id,
      },
      updatedUserPassword.tokenSecret
    );

    return {
      token,
      tokenSecret: updatedUserPassword.tokenSecret,
      user: {
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
