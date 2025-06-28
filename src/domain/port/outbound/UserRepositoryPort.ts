import { User } from "../../model/user/User";

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
}