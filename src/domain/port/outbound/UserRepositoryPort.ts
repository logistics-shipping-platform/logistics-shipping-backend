import { User } from "../../model/user/User";

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findByEmailOrDocument(
    email: string,
    document: string
  ): Promise<User | null>;
  save(user: User): Promise<void>;
}