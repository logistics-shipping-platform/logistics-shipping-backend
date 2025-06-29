import { DocType, User } from "../../../domain/model/user";
import { RegisterUserPort } from "../../../domain/port/inbound";
import { PasswordHasherPort, UserRepositoryPort } from "../../../domain/port/outbound";

export class RegisterUserUseCase implements RegisterUserPort {
  constructor(
    private users: UserRepositoryPort,
    private hasher: PasswordHasherPort
  ) { }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña del usuario.
   * @param fullName - Nombre completo del usuario.
   * @param documentType - Tipo de documento del usuario.
   * @param document - Número de documento del usuario.
   * @returns {Promise<{ userId: string }>} - ID del usuario registrado.
   */
  async execute({
    email,
    password,
    fullName,
    documentType,
    document
  }: {
    email: string;
    password: string;
    fullName: string;
    documentType: DocType;
    document: string;
  }): Promise<{ userId: string }> {


    const userExisting = await this.users.findByEmailOrDocument(
      email,
      document.trim()
    );

    // Verifica si ya existe un usuario con el mismo email o documento
    if (userExisting) {
      if (userExisting.getEmail() === email) {
        throw new Error('Ya existe un usuario con el correo ingresado');
      }
      throw new Error('Ya existe un usuario con el documento ingresado');
    }

    // Si es un usuario nuevo, se crea un nuevo objeto User
    const hash = await this.hasher.hash(password);
    const user = User.create({ email: email, passwordHash: hash, fullName, documentType, document });
    await this.users.save(user);

    return { userId: user.getId() };
  }
}