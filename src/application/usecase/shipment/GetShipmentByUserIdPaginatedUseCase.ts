import { GetShipmentByUserIdPaginatedDTO } from "../../../adapter/inbound/http/dto/GetShipmentByUserIdPaginatedDTO";
import { ShipmentRepositoryPort } from "../../../domain/port/outbound/ShipmentRepositoryPort";
import { ShipmentResponseDTO } from "../../../adapter/inbound/http/dto/ShipmentResponseDTO";

export class GetShipmentByUserIdPaginatedUseCase {
  constructor(
    private readonly shipmentRepo: ShipmentRepositoryPort
  ) {}

  /**
   * Obtiene un envío por su ID.
   * @param shipmentId - El ID del envío a buscar.
   * @returns Una promesa que resuelve con el envío encontrado o null si no se encuentra.
   */
  async execute(findDto: GetShipmentByUserIdPaginatedDTO): Promise<ShipmentResponseDTO[]> {
    const { userId, page, count } = findDto;

    return (await this.shipmentRepo.findAllByUserIdPaginated(userId, page, count)).map(shipment => {
      return new ShipmentResponseDTO({
        id: shipment.getId(),
        originId: shipment.getOriginId(),
        destinationId: shipment.getDestinationId(),
        weight: shipment.getParcel().getWeight(),
        length: shipment.getParcel().getLength(),
        width: shipment.getParcel().getWidth(),
        height: shipment.getParcel().getHeight(),
        chargeableWeight: shipment.getParcel().getChargeableWeight(),
        price: shipment.getParcel().getPrice(),
        state: shipment.getState(),
        createdAt: shipment.getCreatedAt().toISOString()
      });
    });
  }
}