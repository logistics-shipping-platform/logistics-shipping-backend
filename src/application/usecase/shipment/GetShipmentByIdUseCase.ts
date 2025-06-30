import { ShipmentRepositoryPort } from "../../../domain/port/outbound/ShipmentRepositoryPort";
import { Shipment } from '../../../domain/model/shipment';

export class GetShipmentByIdUseCase {
  constructor(
    private readonly shipmentRepo: ShipmentRepositoryPort
  ) {}

  /**
   * Obtiene un envío por su ID.
   * @param shipmentId - El ID del envío a buscar.
   * @returns Una promesa que resuelve con el envío encontrado o null si no se encuentra.
   */
  async execute(shipmentId: string): Promise<Shipment | null> {
    return this.shipmentRepo.findById(shipmentId);
  }
}