export interface PasswordHasherPort {
  
  /**
   * Genera un hash a partir de un texto plano.
   * @param {string} raw - El texto plano a hashear.
   * @returns {Promise<string>} - Devuelve el hash generado.
   */
  hash(raw: string): Promise<string>;

  /**
   * Compara un texto plano con un hash.
   * @param {string} raw - El texto plano a comparar.
   * @param {string} hash - El hash a comparar.
   * @returns {Promise<boolean>} - Devuelve true si los textos coinciden, false en caso contrario.
   */
  compare(raw: string, hash: string): Promise<boolean>;
}