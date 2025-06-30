import { ShipmentState } from "../../model/shipment";

export class ShipmentStateChanged {
  constructor(
    public readonly shipmentId: string,
    public readonly newState: ShipmentState,
    public readonly changedAt: Date
  ) {}
}