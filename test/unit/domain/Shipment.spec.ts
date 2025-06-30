import { Parcel } from "../../../src/domain/model/parcel";
import { Shipment, ShipmentState, StateHistoryEntry } from "../../../src/domain/Shipment";

const parcel = new Parcel(1, 22, 16, 11);
parcel.setChargeableWeight(2);
parcel.setPrice(4500);

const stateHistory: StateHistoryEntry[] = [{
    state: ShipmentState.WAITING,
    changedAt: new Date("2025-06-29T23:46:26.000Z")
}];
const shipment = new Shipment(
    "86779142-2bae-4264-aee6-ac7bb69bd085",
    "11111111-1111-1111-1111-111111111111",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "dc7fc307-8da0-47ac-a068-0e130f44aa97",
    parcel,
    stateHistory,
    ShipmentState.WAITING,
    new Date("2025-06-29T23:46:26.000Z")
);

describe('Shipment.createdAt', () => {

    it('Verifica el getter', async () => {
        expect(shipment.getCreatedAt()).toEqual(new Date("2025-06-29T23:46:26.000Z"));
    });

    it('Verifica el setter', async () => {
        const newDate = new Date("2025-07-01T00:00:00.000Z");
        shipment.setCreatedAt(newDate);
        expect(shipment.getCreatedAt()).toEqual(newDate);
    });
});

describe('Shipment.changeState', () => {

    it('Verifica el cambio de estado', async () => {
        shipment.changeState(ShipmentState.IN_TRANSIT);
        expect(shipment.getState()).toBe(ShipmentState.IN_TRANSIT);
    });

    it('Verifica el registro de historial al cambiar de estado', async () => {
        shipment.changeState(ShipmentState.IN_TRANSIT);
        expect(shipment.getState()).toBe(ShipmentState.IN_TRANSIT);
        expect(shipment.getStateHistory()).toEqual([{
            state: ShipmentState.WAITING,
            changedAt: new Date("2025-06-29T23:46:26.000Z")
        }, {
            state: ShipmentState.IN_TRANSIT,
            changedAt: expect.any(Date)
        }]);
    });
    
});
