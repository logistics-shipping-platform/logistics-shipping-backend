import {
  UserRepositoryPort,
  PasswordHasherPort,
  TokenServicePort
} from '../../domain/port/outbound';
import { AuthenticateUserPort } from '../../domain/port/inbound';

export class AuthenticateUserUseCase implements AuthenticateUserPort {

  constructor(
    private users: UserRepositoryPort,
    private hasher: PasswordHasherPort,
    private tokenSvc: TokenServicePort
  ) {}

 /**
  * Autentica a un usuario con su email y contraseña.
  * @param email - El email del usuario.
  * @param password - La contraseña del usuario.
  * @returns Un objeto que contiene el token JWT si la autenticación es exitosa.
  * @throws Error si las credenciales son inválidas.
  */
  async execute({ email, password }: { email: string; password: string }) {

    // Obtiene un usuario con el email proporcionado
    const user = await this.users.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    // Verifica si la contraseña proporcionada coincide con el hash almacenado
    const valid = await user.verifyPassword(password, this.hasher);
    if (!valid) throw new Error('Credenciales inválidas');

    // Genera un JWT para el usuario autenticado
    const token = await this.tokenSvc.generate({ userId: user.getId(), email: user.getEmail() });

    return { token };
  }
}