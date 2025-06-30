import { Parcel } from "../../../domain/model/parcel";
import { Shipment, ShipmentState, StateHistoryEntry } from "../../../domain/Shipment";
import { ShipmentRepositoryPort } from "../../../domain/port/outbound/ShipmentRepositoryPort";
import { Pool, RowDataPacket } from 'mysql2/promise';
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
                shipment.getId(),
                shipment.getOriginId(),
                shipment.getDestinationId(),
                shipment.getUserId(),
                shipment.getParcel().getChargeableWeight(),
                shipment.getParcel().getPrice(),
                shipment.getParcel().getWeight(),
                shipment.getParcel().getLength(),
                shipment.getParcel().getWidth(),
                shipment.getParcel().getHeight(),
                shipment.getState(),
                new Date()
            ]);
            //Prepara los datos para insertar en la tabla shipment_state_history
            const historyId = uuid();
            const firstHistory = shipment.getStateHistory()[0];

            // Inserta el primer estado del Shipment en la tabla shipment_state_history
            const sql2 = `
                INSERT INTO shipment_state_history
                    (id, shipment_id, state, changed_at)
                VALUES (?, ?, ?, ?)
            `;
            await connection.execute(sql2, [
                historyId,
                shipment.getId(),
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

    /**
     * Busca un Shipment por su ID.
     * @param id - El ID del Shipment a buscar.
     * @returns Una promesa que resuelve con el Shipment encontrado o null si no existe.
     */
    async findById(id: string): Promise<Shipment | null> {
        const connection = await this.pool.getConnection();
        try {
            // Obtiene el Shipment por id
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT 
                    id,
                    origin_id   AS originId,
                    destination_id AS destinationId,
                    user_id     AS userId,
                    parcel_weight   AS weight,
                    parcel_length   AS length,
                    parcel_width    AS width,
                    parcel_height   AS height,
                    chargeable_weight,
                    price,
                    current_state    AS state,
                    created_at       AS createdAt
                    FROM shipments
                    WHERE id = ?`,
                [id]
            );
            if (rows.length === 0) {
                return null;
            }
            const shipmentFound = rows[0];
            // Construye el Parcel a partir de los datos almacenados en el Shipment
            const parcel = new Parcel(
                shipmentFound.weight,
                shipmentFound.length,
                shipmentFound.width,
                shipmentFound.height
            );
            parcel.setChargeableWeight(shipmentFound.chargeable_weight);
            parcel.setPrice(shipmentFound.price);

            //Carga el historial de estados
            const [histRows] = await connection.query<RowDataPacket[]>(
                `SELECT 
                    id,
                    state,
                    changed_at
                    FROM shipment_state_history
                    WHERE shipment_id = ?
                    ORDER BY changed_at ASC`,
                [id]
            );

            //Se convierte el historial de estados a un array de StateHistoryEntry
            const stateHistory: StateHistoryEntry[] = histRows.map(historyData => ({
                state: historyData.state as ShipmentState,
                changedAt: new Date(historyData.changed_at),
            }));

            //Se Crea la entidad Shipment e inyecta el historial
            const shipment = new Shipment(
                shipmentFound.id,
                shipmentFound.originId,
                shipmentFound.destinationId,
                shipmentFound.userId,
                parcel,
                stateHistory,
                shipmentFound.state as ShipmentState,
                shipmentFound.createdAt
            );

            return shipment;
        } finally {
            connection.release();
        }
    }

    updateState(shipmentId: string, newState: ShipmentState, changedAt: Date): Promise<void> {
        throw new Error("Method not implemented.");
    }
}