import { Fare, FareType } from '../model/fare';
import { FareRepositoryPort } from '../port/outbound';

export class FareService {
  constructor(private readonly fareRepo: FareRepositoryPort) {}

  /**
   * Obtiene una tarifa de un tipo (distancia o peso) y valor
   * @param {FareType} type - Tipo de tarifa.
   * @param {number} value - Valor de la tarifa.
   * @returns {Promise<Fare[]>} - Lista de tarifas.
   */
  async getPriceFor(type: FareType, value: number): Promise<number> {
    const fare = await this.fareRepo.findByTypeAndValue(type, value);
    
    if (!fare) {
      throw new Error(`No hay una tarifa para ${type} con valor ${value}`);
    }

    return fare.getPrice();
  }
}