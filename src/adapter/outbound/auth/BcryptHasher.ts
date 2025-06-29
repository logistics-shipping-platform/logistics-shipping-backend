import bcrypt from 'bcrypt';
import { PasswordHasherPort } from '../../../domain/port/outbound';

export class BcryptHasher implements PasswordHasherPort {
  
  /**
   * Hashea una cadena de texto utilizando bcrypt.
   * @param raw - La cadena de texto a hashear.
   * @returns Una promesa que se resuelve con el hash generado.
   */
  async hash(raw: string) { 
    return bcrypt.hash(raw, 10); 
  }

  /**
   * Compara una cadena de texto con un hash.
   * @param raw - La cadena de texto a comparar.
   * @param hash - El hash con el que comparar.
   * @returns Una promesa que se resuelve con true si coinciden, false en caso contrario.
   */
  async compare(raw: string, hash: string) { 
    return bcrypt.compare(raw, hash); 
  }
}