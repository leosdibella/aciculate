import { registry } from '@shared/utilities';
import {
  ICreateUserRequest,
  IDbContext,
  IUserModel,
  IUserService
} from '../interfaces';
import { generateHash, generateSalt } from '../utilities';
import { DependencyInjectionToken } from '../enums';
import { DbContext } from './db-context';
import { OrganizationUserRoleEntity } from './organization-user-role-entity';
import { UserEntity } from './user-entity';

export class UserService implements IUserService {
  private readonly _dbContext: IDbContext;

  public async get(id: string) {
    return this._dbContext.get(new UserEntity({ id }));
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
    const user = await this._dbContext.insert(new UserEntity(userModel));

    await this._dbContext.insert(
      new OrganizationUserRoleEntity({
        organizationId: request.organizationId,
        roleId: request.roleId,
        userId: user.id
      })
    );

    return user;
  }

  public constructor() {
    this._dbContext = registry.inject<DbContext>(
      DependencyInjectionToken.dbContext
    )!;
  }
}
