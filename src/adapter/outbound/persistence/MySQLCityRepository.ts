import { Pool } from 'mysql2/promise';
import { CityRepositoryPort } from '../../../domain/port/outbound/CityRepositoryPort';
import { City } from '../../../domain/model/city';

export class MySQLCityRepository implements CityRepositoryPort {
  constructor(private readonly pool: Pool) {}
    
  /**
   * Obtiene la ciudad por su ID.
   * @param {string} id - ID de la ciudad
   * @return {Promise<City>}
   */
  async getCityById(id: string): Promise<City> {
    const [rows] = await this.pool.query('SELECT id, name, latitude, longitude FROM cities WHERE id = ?', [id]);

    const foundCity = rows as any[];
    if (foundCity.length === 0) {
      throw new Error('City not found');
    }
    
    return new City(foundCity[0].id, foundCity[0].name, foundCity[0].latitude, foundCity[0].longitude);
  }
}
