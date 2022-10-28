import { dependencyInjectionTokens } from '@data';
import { EntityName } from '@enums/database';
import { IAuthenticationService, IDatabaseContext } from '@interfaces';
import { ApiError } from '@shared/classes';
import { inject } from '@shared/decorators';
import { ApiErrorCode } from '@shared/enums';
import { generateHash, generateToken } from '@utilities';
import { randomUUID } from 'crypto';

export class AuthenticationService implements IAuthenticationService {
  readonly #databaseContext: IDatabaseContext;

  public async authenticate(username: string, password: string) {
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
      throw new ApiError([
        {
          errorCode: ApiErrorCode.invalidUsernamePasswordCombination,
          message: `The password provided for the username, ${username} is invalid.`
        }
      ]);
    }

    const updatedUserPassword = await this.#databaseContext.updateSingle(
      EntityName.userPassword,
      {
        tokenSecret: randomUUID()
      }
    );

    const organizationId =
      user.defaulyOrganizationId ?? user.organizations?.[0]?.id ?? '';

    const organizationModel = await this.#databaseContext.selectSingle(
      EntityName.organization,
      organizationId
    );

    const organizationUserRole = (
      await this.#databaseContext.selectMany({
        entityName: EntityName.organizationUserRole,
        take: 1
      })
    ).results[0];

    const systemModel = (
      await this.#databaseContext.selectMany({
        entityName: EntityName.system,
        take: 1
      })
    ).results[0];

    const token = generateToken(
      {
        userId: user.id,
        userSignature: user.signature,
        organizationId,
        organizationIds: user.organizations?.map((o) => o.id) ?? [],
        organizationSignature: organizationModel.signature,
        systemSignature: systemModel.signature,
        roleId: organizationUserRole.roleId
      },
      updatedUserPassword.tokenSecret
    );

    return {
      token,
      tokenSecret: updatedUserPassword.tokenSecret
    };
  }

  async revokeSystemTokens(reallowOn: Date) {
    await this.#databaseContext.updateSingle(EntityName.system, {
      signature: reallowOn
    });
  }

  async revokeOrganizationTokens(organizationId: string, reallowOn: Date) {
    await this.#databaseContext.updateSingle(EntityName.organization, {
      id: organizationId,
      signature: reallowOn
    });
  }

  async revokeUserTokens(userId: string, reallowOn: Date) {
    await this.#databaseContext.updateSingle(EntityName.user, {
      id: userId,
      signature: reallowOn
    });
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
