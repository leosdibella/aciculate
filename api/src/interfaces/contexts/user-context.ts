export interface IUserContext {
  readonly userId: string;
  readonly roleId: string;
  readonly organizationId: string;
  readonly organizationSignature: string;
  readonly applicationSignature: string;
  readonly organizationIds: string[];
}
