import bcrypt from 'bcrypt';
import { PasswordHasherPort } from '../../../domain/port/outbound';

export class BcryptHasher implements PasswordHasherPort {
  async hash(raw: string) { 
    return bcrypt.hash(raw, 10); 
  }
  async compare(raw: string, hash: string) { 
    return bcrypt.compare(raw, hash); 
  }
}