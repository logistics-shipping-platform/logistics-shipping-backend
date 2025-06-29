import { ShipmentRepositoryPort } from "../../../domain/port/outbound/ShipmentRepositoryPort";
import { Shipment, ShipmentState } from "../../../domain/Shipment";
import { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';

export class MYSQLShipmentRepository implements ShipmentRepositoryPort {

    constructor(private readonly pool: Pool) { }

    /**
     * Crea un nuevo Shipment en la base de datos.
     * @param shipment - El objeto Shipment a guardar.
     * @returns Una promesa que se resuelve cuando el Shipment ha sido guardado.
     */
    async create(shipment: Shipment): Promise<void> {
        const connection = await this.pool.getConnection();
        try {
            //Inserta el Shipment en la tabla shipments
            const sqlInsertShipment = `
                INSERT INTO shipments 
                    (id, origin_id, destination_id, user_id, chargeable_weight, price, parcel_weight, parcel_length, parcel_width, parcel_height, current_state, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(sqlInsertShipment, [
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
            //Prepara los datos para insertar en la tabla shipment_state_history
            const historyId = uuid();
            const firstHistory = shipment.getStateHistory()[0];
            console.log('Primer estado del Shipment:', firstHistory);
            
            // Inserta el primer estado del Shipment en la tabla shipment_state_history
            const sql2 = `
                INSERT INTO shipment_state_history
                    (id, shipment_id, state, changed_at)
                VALUES (?, ?, ?, ?)
            `;
            await connection.execute(sql2, [
                historyId,
                shipment.id,
                firstHistory.state,
                firstHistory.changedAt
            ]);
        } catch (err) {
            console.error('Error al crear el Shipment:', err);
            await connection.rollback();
            throw new Error('Error al crear el envio, por favor intente nuevamente más tarde.');
        } finally {
            connection.release();
        }


    }
    findById(id: string): Promise<Shipment | null> {
        throw new Error("Method not implemented.");
    }
    updateState(shipmentId: string, newState: ShipmentState, changedAt: Date): Promise<void> {
        throw new Error("Method not implemented.");
    }
}