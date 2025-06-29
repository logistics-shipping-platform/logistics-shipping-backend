import { ShipmentState } from "./ShipmentState";

export interface StateHistoryEntry {
  state: ShipmentState;
  changedAt: Date;
}