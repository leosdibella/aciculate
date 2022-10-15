import {
  ICreateUserRequest,
  IDatabaseContext,
  IUserModel,
  IUserService
} from '@interfaces';
import { generateHash, generateSalt } from '@utilities';
import { OrganizationUserRoleEntity, UserEntity } from '@classes/entities';
import { inject } from '@shared/decorators';
import { dependencyInjectionTokens } from '@data';

export class UserService implements IUserService {
  readonly #databaseContext: IDatabaseContext;

  public async get(id: string) {
    return this.#databaseContext.get(new UserEntity({ id }));
  }

  public async create(request: ICreateUserRequest) {
    const salt = generateSalt();

    const userModel: Partial<IUserModel> = {
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      passwordHash: await generateHash(request.password, salt),
      passwordSalt: salt
    };

    // TODO: Query before inserting
    const user = await this.#databaseContext.insert(new UserEntity(userModel));

    await this.#databaseContext.insert(
      new OrganizationUserRoleEntity({
        organizationId: request.organizationId,
        roleId: request.roleId,
        userId: user.id
      })
    );

    return user;
  }

  public constructor(
    @inject(dependencyInjectionTokens.databaseContext)
    databaseContext: IDatabaseContext
  ) {
    this.#databaseContext = databaseContext;
  }
}
