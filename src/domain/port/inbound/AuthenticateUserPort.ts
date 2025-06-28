export interface AuthenticateUserPort {
  execute(dto: { email: string; password: string }): Promise<{ token: string }>;
}