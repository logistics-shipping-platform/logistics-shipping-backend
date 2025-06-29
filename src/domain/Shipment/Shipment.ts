import { Parcel } from "../model/parcel";
import { ShipmentState } from "./ShipmentState";
import { StateHistoryEntry } from "./StateHistoryEntry";

export class Shipment {

    constructor(
        public readonly id: string,
        public readonly originId: string,
        public readonly destinationId: string,
        public readonly userId: string,
        public readonly parcel: Parcel,
        private history: StateHistoryEntry[] = [],
        private state: ShipmentState = ShipmentState.PICKED_UP,
    ) {
    }

    getState(): ShipmentState {
        return this.state;
    }

    getStateHistory(): ReadonlyArray<StateHistoryEntry> {
        return this.history;
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
        this.history.push({ state: newState, changedAt: new Date() });
    }
}