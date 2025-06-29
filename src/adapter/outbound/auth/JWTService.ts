import * as jwt from 'jsonwebtoken';
import { TokenServicePort } from '../../../domain/port/outbound';

export class JWTService implements TokenServicePort {
  private secret = process.env.JWT_SECRET!;
  private expiresIn = '1h';

  /**
   * Genera un token JWT con el payload proporcionado.
   * @param payload - Los datos a incluir en el token.
   * @returns Una promesa que se resuelve con el token generado.
   */
  async generate(payload: Record<string, any>) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  /**
   * Verifica un token JWT y devuelve su payload si es válido.
   * @param token - El token a verificar.
   * @returns Una promesa que se resuelve con el payload del token o null si no es válido.
   */
  async verify(token: string): Promise<Record<string, any> | null> {
    try {
      return jwt.verify(token, this.secret) as Record<string, any>;
    } catch (err) {
      return null;
    }
  }
}