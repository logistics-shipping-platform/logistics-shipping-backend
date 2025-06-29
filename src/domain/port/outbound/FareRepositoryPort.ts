import { Fare, FareType } from "../../model/fare";


export interface FareRepositoryPort {

  /**
   * Obtiene todas las tarifas de un tipo (distancia o peso)
   * @param {FareType} type - Tipo de tarifa (DISTANCE o WEIGHT)
   * @return {Promise<Fare[]>} - Lista de tarifas
   */
  findByType(type: FareType): Promise<Fare[]>;
  
  /**
   * Busca una tarifa por tipo y valor (distancia o peso)
   * @param {FareType} type - Tipo de tarifa (DISTANCE o WEIGHT)
   * @param {number} value - Valor de la tarifa (distancia o peso)
   * @return {Promise<Fare | null>} - Tarifa encontrada o null si no
   */
  findByTypeAndValue(type: FareType, value: number): Promise<Fare | null>;
}