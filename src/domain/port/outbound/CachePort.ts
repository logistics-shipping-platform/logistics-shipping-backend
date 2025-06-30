export interface CachePort {
  /**
   * Obtiene un valor stringificado por clave, o null si no existe
   * @param key - La clave del valor a obtener
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Guarda un valor serializado bajo la clave y con el tiempo de vida en segundos
   * @param key - La clave del valor a guardar
   * @param value - El valor a guardar
   * @param ttlSeconds - El tiempo de vida en segundos
   */
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}