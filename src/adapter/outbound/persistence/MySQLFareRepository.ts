import { Pool } from 'mysql2/promise';
import { FareRepositoryPort } from '../../../domain/port/outbound';
import { Fare, FareType } from '../../../domain/model/fare';


export class MySQLFareRepository implements FareRepositoryPort {
  constructor(private readonly pool: Pool) {}

  /**
   * Obtiene todas las tarifas de un tipo (distancia o peso)
   * @param {FareType} type - Tipo de tarifa (DISTANCE o WEIGHT)
   * @return {Promise<Fare[]>} - Lista de tarifas
   */
  async findByType(type: FareType): Promise<Fare[]> {

    const [rows] = await this.pool.query<any[]>(
      `SELECT id, type, from_value, to_value, price
       FROM rates
       WHERE type = ?
       ORDER BY from_value`,
      [type]
    );

    return rows.map(r => new Fare(r.id, r.type, r.from_value, r.to_value, r.price));
  }

  /**
   * Busca una tarifa por tipo y valor (distancia o peso)
   * @param {FareType} type - Tipo de tarifa (DISTANCE o WEIGHT)
   * @param {number} value - Valor de la tarifa (distancia o peso)
   * @return {Promise<Fare | null>} - Tarifa encontrada o null si no
   */
  async findByTypeAndValue(type: FareType, value: number): Promise<Fare | null> {
    const [rows] = await this.pool.query<any[]>(
      `SELECT id, type, from_value, to_value, price
       FROM rates
       WHERE type = ?
         AND from_value <= ?
         AND (to_value >= ? OR to_value IS NULL)
       LIMIT 1`,
      [type, value, value]
    );

    if (rows.length === 0) return null;
    const foundFare = rows[0];

    return new Fare(foundFare.id, foundFare.type, foundFare.from_value, foundFare.to_value, foundFare.price);
  }
}