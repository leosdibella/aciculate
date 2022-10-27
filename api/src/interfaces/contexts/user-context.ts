export interface IUserContext {
  readonly userId: string;
  readonly roleId: string;
  readonly organizationId: string;
  readonly organizationSignature: Date;
  readonly systemSignature: Date;
  readonly userSignature: Date;
  readonly organizationIds: string[];
}
