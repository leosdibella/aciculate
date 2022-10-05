import { registry } from '@shared/utilities';
import {
  ICreateUserRequest,
  IDbContext,
  IDbContextConstructor,
  IUserContext,
  IUserModel,
  IUserService
} from '@interfaces';
import { generateHash, generateSalt } from '@utilities';
import { DependencyInjectionToken } from '@enums';
import { OrganizationUserRoleEntity, UserEntity } from '@classes/entities';
import { DbContext } from '@classes/contexts';

export class UserService implements IUserService {
  readonly #dbContext: IDbContext;

  public async get(id: string) {
    return this.#dbContext.get(new UserEntity({ id }));
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
    const user = await this.#dbContext.insert(new UserEntity(userModel));

    await this.#dbContext.insert(
      new OrganizationUserRoleEntity({
        organizationId: request.organizationId,
        roleId: request.roleId,
        userId: user.id
      })
    );

    return user;
  }

  public constructor(userContext: IUserContext) {
    const DbContextConstructor = registry.inject<IDbContextConstructor>(
      DependencyInjectionToken.dbContextConstructor,
      DbContext
    )!;

    this.#dbContext = new DbContextConstructor(userContext);
  }
}
