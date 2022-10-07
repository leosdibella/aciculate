import {
  ICreateUserRequest,
  IDbContext,
  IUserModel,
  IUserService
} from '@interfaces';
import { generateHash, generateSalt } from '@utilities';
import { OrganizationUserRoleEntity, UserEntity } from '@classes/entities';
import { inject } from '@shared/decorators';
import { dependencyInjectionTokens } from 'src/data';

export class UserService implements IUserService {
  public async get(id: string) {
    return this._databaseContext.get(new UserEntity({ id }));
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
    const user = await this._databaseContext.insert(new UserEntity(userModel));

    await this._databaseContext.insert(
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
    private readonly _databaseContext: IDbContext
  ) {}
}
