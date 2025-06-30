import { Parcel } from "../parcel";
import { ShipmentState } from "./ShipmentState";
import { StateHistoryEntry } from "./StateHistoryEntry";

export class Shipment {

    constructor(
        private readonly id: string,
        private readonly originId: string,
        private readonly destinationId: string,
        private readonly userId: string,
        private readonly parcel: Parcel,
        private stateHistory: StateHistoryEntry[] = [],
        private state: ShipmentState = ShipmentState.CREATED,
        private createdAt: Date = new Date()
    ) {
    }

    getId(): string {
        return this.id;
    }

    getOriginId(): string {
        return this.originId;
    }

    getDestinationId(): string {
        return this.destinationId;
    }

    getUserId(): string {
        return this.userId;
    }

    getParcel(): Parcel {
        return this.parcel;
    }

    getState(): ShipmentState {
        return this.state;
    }

    getStateHistory(): ReadonlyArray<StateHistoryEntry> {
        return this.stateHistory;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    setCreatedAt(createdAt: Date): void {
        this.createdAt = createdAt;
    }

    /**
    * Cambia el estado del envío y guarda el cambio en el historial.
    * Si el estado es el mismo, no hace nada.
    * @param newState El nuevo estado al que se desea cambiar.
    */
    changeState(newState: ShipmentState): void {
        if (this.state === newState) return;
        this.state = newState;
        this.recordState(newState);
    }

    /**
     * Registra el estado actual en el historial.
     * @param state El estado actual del envío.
     * @private
     */
    private recordState(newState: ShipmentState) {
        this.stateHistory.push({ state: newState, changedAt: new Date() });
    }
}