import { PasswordHasherPort } from "../../port/outbound";

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    private passwordHash: string
  ) { }
  
  async verifyPassword(
    raw: string,
    hasher: PasswordHasherPort
  ): Promise<boolean> {
    return hasher.compare(raw, this.passwordHash);
  }
}