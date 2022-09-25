export interface ICreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationId: string;
  roleId: string;
}
