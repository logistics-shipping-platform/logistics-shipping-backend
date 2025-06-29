import { User } from "../../model/user/User";

export interface UserRepositoryPort {
  /**
   * Busca un usuario por su email.
   * @param {string} email - Email del usuario.
   * @returns {Promise<User | null>} - Usuario encontrado o null si no existe.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca un usuario por su documento o su email.
   * @param {string} document - Documento del usuario.
   * @param {string} email - Email del usuario.
   * @returns {Promise<User | null>} - Usuario encontrado o null si no existe.
   */
  findByEmailOrDocument(
    email: string,
    document: string
  ): Promise<User | null>;

  /**
   * Guarda un nuevo usuario.
   * @param {User} user - El usuario a guardar.
   * @returns {Promise<void>}
   */
  save(user: User): Promise<void>;
}