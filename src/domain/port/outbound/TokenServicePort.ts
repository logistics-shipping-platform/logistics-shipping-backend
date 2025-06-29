export interface TokenServicePort {
  /**
   * Genera un token a partir del payload.
   * @param {Record<string, any>} payload - Los datos a incluir en el token.
   * @returns {Promise<string>} - El token generado.
   */
  generate(payload: Record<string, any>): Promise<string>;

  /**
   * Verifica el token proporcionado y devuelve el payload decodificado si es válido.
   * @param {string} token - El token a verificar.
   * @returns {Promise<Record<string, any> | null>} - El payload decodificado o null si es inválido.
   */
  verify(token: string): Promise<Record<string, any> | null>;
}