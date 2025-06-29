import { City } from "../../model/city";

export interface CityRepositoryPort {
  /**
   * Obtiene la ciudad por su ID.
   * @param {string} id - ID de la ciudad
   * @return {Promise<City | null>}
   */
  getCityById(id: string): Promise<City | null>;

  /**
   * Obtiene todas las ciudades.
   * @return {Promise<City[]>}
   */
  getCities(): Promise<City[]>;
}