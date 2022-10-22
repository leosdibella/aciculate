export interface IAuthenticationService {
  authenticate(username: string, password: string): Promise<
}
