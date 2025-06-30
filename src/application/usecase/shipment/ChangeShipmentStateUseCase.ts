import { ShipmentStateChanged } from "../../../domain/event";
import { ShipmentState } from "../../../domain/model/shipment";
import { NotificationPort, ShipmentRepositoryPort } from "../../../domain/port/outbound";

export class ChangeShipmentStateUseCase {
  constructor(
    private repo: ShipmentRepositoryPort,
    private notifier: NotificationPort
  ) {}

  async execute(shipmentId: string, newState: ShipmentState): Promise<void> {
    
    //Se edita el estado del envío
    await this.repo.updateState(shipmentId, newState, new Date());

    // Publico el evento
    this.notifier.publish(
      `shipments.${shipmentId}`,
      new ShipmentStateChanged(shipmentId, newState, new Date())
    );
  }
}