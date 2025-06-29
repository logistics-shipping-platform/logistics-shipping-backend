import { Shipment, ShipmentState } from "../../Shipment";

export interface ShipmentRepositoryPort {
  create(shipment: Shipment): Promise<void>;
  findById(id: string): Promise<Shipment | null>;
  updateState(shipmentId: string, newState: ShipmentState, changedAt: Date): Promise<void>;
}