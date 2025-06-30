import { ShipmentStateChanged } from "../../../domain/event";
import { ShipmentState } from "../../../domain/model/shipment";
import { NotificationPort, ShipmentRepositoryPort } from "../../../domain/port/outbound";

export class ChangeShipmentStateUseCase {
  constructor(
    private repo: ShipmentRepositoryPort,
    private notifier: NotificationPort
  ) {}

  /**
   * Cambia el estado de un envío y notifica a los suscriptores.
   * @param shipmentId - El ID del envío cuyo estado se va a cambiar.
   * @param newState - El nuevo estado que se asignará al envío.
   * @returns Una promesa que resuelve cuando se complete la operación.
   */
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