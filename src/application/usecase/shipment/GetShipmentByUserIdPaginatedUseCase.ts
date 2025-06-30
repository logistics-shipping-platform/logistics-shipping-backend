import { GetShipmentByUserIdPaginatedDTO } from "../../../adapter/inbound/http/dto/GetShipmentByUserIdPaginatedDTO";
import { ShipmentRepositoryPort } from "../../../domain/port/outbound/ShipmentRepositoryPort";
import { Shipment } from '../../../domain/Shipment';

export class GetShipmentByUserIdPaginatedUseCase {
  constructor(
    private readonly shipmentRepo: ShipmentRepositoryPort
  ) {}

  /**
   * Obtiene un envío por su ID.
   * @param shipmentId - El ID del envío a buscar.
   * @returns Una promesa que resuelve con el envío encontrado o null si no se encuentra.
   */
  async execute(findDto: GetShipmentByUserIdPaginatedDTO): Promise<Shipment[]> {
    const { userId, page, count } = findDto;
    return this.shipmentRepo.findAllByUserIdPaginated(userId, page, count);
  }
}