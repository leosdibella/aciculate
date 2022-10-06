import { authenticate, httpController, route } from '@decorators';
import { IController } from '@interfaces/controllers';
import { HttpStatusCode, HttpVerb } from '@shared/enums';
import { Request, Response } from 'express';
import { BaseController } from './base-controller';
import { OrganizationUserRoleEntity, UserEntity } from '@classes/entities';
import { generateHash, generateSalt } from '@utilities';
import { IUserModel } from '@interfaces/models';

@httpController()
export class UserController extends BaseController implements IController {
  @authenticate()
  @route(HttpVerb.get, '/:id')
  public async get() {
    const id = this.request.params.id;

    try {
      const user = await this.dbContext.get(new UserEntity({ id }));

      this.response.send(user);
    } catch {
      this.response.send(HttpStatusCode.notFound);
    }
  }

  @route(HttpVerb.post, '/create')
  public async create() {
    const salt = generateSalt();

    const userModel: Partial<IUserModel> = {
      firstName: this.request.firstName,
      lastName: this.request.lastName,
      email: this.request.email,
      passwordHash: await generateHash(this.request.password, salt),
      passwordSalt: salt
    };

    // TODO: Query before inserting
    const user = await this.dbContext.insert(new UserEntity(userModel));

    await this.dbContext.insert(
      new OrganizationUserRoleEntity({
        organizationId: this.request.organizationId,
        roleId: this.request.roleId,
        userId: user.id
      })
    );

    return user;
  }

  public constructor(request: Request, response: Response) {
    super(request, response);
  }
}
