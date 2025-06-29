import { ShipmentRepositoryPort } from "../../../domain/port/outbound/ShipmentRepositoryPort";
import { Shipment, ShipmentState } from "../../../domain/Shipment";
import { Pool } from 'mysql2/promise';

export class MYSQLShipmentRepository implements ShipmentRepositoryPort {

    constructor(private readonly pool: Pool) {}
    
    /**
     * Crea un nuevo Shipment en la base de datos.
     * @param shipment - El objeto Shipment a guardar.
     * @returns Una promesa que se resuelve cuando el Shipment ha sido guardado.
     */
    async create(shipment: Shipment): Promise<void> {
        console.log("Creating shipment in MySQL:", shipment);
        const sql = `
            INSERT INTO shipments 
                (id, origin_id, destination_id, user_id, chargeable_weight, price, parcel_weight, parcel_length, parcel_width, parcel_height, current_state, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await this.pool.execute(sql, [
            shipment.id,
            shipment.originId,
            shipment.destinationId,
            shipment.userId,
            shipment.parcel.getChargeableWeight(),
            shipment.parcel.getPrice(),
            shipment.parcel.getWeight(),
            shipment.parcel.getLength(),
            shipment.parcel.getWidth(),
            shipment.parcel.getHeight(),
            shipment.getState(),
            new Date()
        ]);
    }
    findById(id: string): Promise<Shipment | null> {
        throw new Error("Method not implemented.");
    }
    updateState(shipmentId: string, newState: ShipmentState, changedAt: Date): Promise<void> {
        throw new Error("Method not implemented.");
    }
}