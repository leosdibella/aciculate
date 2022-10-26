export interface IAuthenticationResponse {
  readonly token: string;
  readonly tokenSecret: string;
  readonly user: {
    readonly firstName: string;
    readonly lastName: string;
  };
}
