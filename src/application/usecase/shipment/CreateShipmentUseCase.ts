import { v4 as uuid } from 'uuid';
import { ShipmentRepositoryPort } from "../../../domain/port/outbound/ShipmentRepositoryPort";
import { Parcel } from '../../../domain/model/parcel';
import { CreateShipmentDTO } from '../../../adapter/inbound/http/dto/CreateShipmentDTO';
import { Shipment, ShipmentState } from '../../../domain/model/shipment';


export class CreateShipmentUseCase {
  constructor(
    private readonly shipmentRepo: ShipmentRepositoryPort
  ) {}

  /**
   * Crea un nuevo envío con los datos proporcionados en el DTO.
   * @param dto - Objeto DTO que contiene los datos necesarios para crear el envío.
   * @returns Una promesa que resuelve con el ID del envío creado.
   */
  async execute(dto: CreateShipmentDTO): Promise<{ shipmentId: string }> {
    const id = uuid();
    // Se prepara el objeto Parcel con los datos del DTO
    const parcel = new Parcel(dto.weight, dto.length, dto.width, dto.height);
    parcel.setChargeableWeight(parcel.calculateChargeableWeight(parcel));
    parcel.setPrice(dto.price);

    // Se crea el objeto Shipment con los datos del DTO y el Parcel
    const shipment = new Shipment(
      id, dto.originId, dto.destinationId, dto.userId, parcel
    );
    // Se cambia el estado del Shipment a WAITING (Estado Inicial)
    shipment.changeState(ShipmentState.WAITING);
    
    await this.shipmentRepo.create(shipment);
    return { shipmentId: id };
  }
}