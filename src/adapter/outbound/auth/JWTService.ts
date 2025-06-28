import * as jwt from 'jsonwebtoken';
import { TokenServicePort } from '../../../domain/port/outbound';

export class JWTService implements TokenServicePort {
  private secret = process.env.JWT_SECRET!;
  private expiresIn = '1h';

  async generate(payload: Record<string, any>) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  async verify(token: string): Promise<Record<string, any> | null> {
    try {
      return jwt.verify(token, this.secret) as Record<string, any>;
    } catch (err) {
      return null;
    }
  }
}