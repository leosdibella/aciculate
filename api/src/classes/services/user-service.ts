import {
  ICreateUserRequest,
  IDatabaseContext,
  IUserModel,
  IUserService
} from '@interfaces';
import { generateHash, generateSalt } from '@utilities';
import { inject } from '@shared/decorators';
import { dependencyInjectionTokens } from '@data';
import { EntityName } from '@enums/database';

export class UserService implements IUserService {
  readonly #databaseContext: IDatabaseContext;

  public async selectSingle(id: string) {
    return this.#databaseContext.selectSingle(EntityName.user, id);
  }

  public async insertSingle(request: ICreateUserRequest) {
    const salt = generateSalt();

    const userModel: Partial<IUserModel> = {
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      passwordHash: await generateHash(request.password, salt),
      passwordSalt: salt
    };

    // TODO: Query before inserting
    const user = await this.#databaseContext.insertSingle(
      EntityName.user,
      userModel
    );

    await this.#databaseContext.insertSingle(EntityName.organizationUserRole, {
      organizationId: request.organizationId,
      roleId: request.roleId,
      userId: user.id
    });

    return user;
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
