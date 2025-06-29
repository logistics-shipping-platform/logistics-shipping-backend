import { FareType } from '../model/fare';
import { Parcel } from '../model/parcel';
import { CityRepositoryPort } from '../port/outbound';
import { getDistance } from '../util';
import { FareService } from './FareService';

export class ParcelService {
  constructor(
    private cityRepo: CityRepositoryPort,
    private readonly fareService: FareService
  ) { }

  /**
   * Obtiene el valor de la cotización para un paquete dado el origen, destino y dimensiones.
   * @param {string} originId - ID de la ciudad de origen.
   * @param {string} destinationId - ID de la ciudad de destino.
   * @param {number} weight - Peso del paquete en kg.
   * @param {number} length - Longitud del paquete en cm.
   * @param {number} width - Ancho del paquete en cm.
   * @param {number} height - Altura del paquete en cm.
   * @returns {Promise<Parcel>} - Objeto Parcel con el peso volumétrico y precio calculado.
   */
  async getFareValue(originId: string, destinationId: string, weight: number, length: number, width: number, height: number) {
    const origin = await this.cityRepo.getCityById(originId);
    const destination = await this.cityRepo.getCityById(destinationId);

    if (!origin || !destination) {
      throw new Error('Destino u origen incorrectos');
    }

    // Se calcula la distancia y a partir de ella se obtiene el precio por distancia
    const distanceKm = getDistance(
      origin.getLatitude(), origin.getLongitude(),
      destination.getLatitude(), destination.getLongitude()
    );
    const priceByDistance = await this.fareService.getPriceFor(
      FareType.DISTANCE, Math.ceil(distanceKm)
    );

    // Se crea el objeto Parcel y se calcula el peso volumétrico
    const parcel = new Parcel(weight, length, width, height);
    const chargeableWeight = parcel.calculateChargeableWeight(parcel);

    // Se obtiene el precio por peso
    const priceByWeight = await this.fareService.getPriceFor(
      FareType.WEIGHT, chargeableWeight
    );

    // Se calcula el precio total y se asigna al objeto Parcel
    const totalPrice = priceByDistance + priceByWeight;
    parcel.setChargeableWeight(chargeableWeight);
    parcel.setPrice(totalPrice);

    return parcel;
  }

  

}
