import { Parcel } from "../../../domain/model/parcel";
import { Shipment, ShipmentState, StateHistoryEntry } from "../../../domain/model/shipment";
import { ShipmentRepositoryPort } from "../../../domain/port/outbound/ShipmentRepositoryPort";
import { Pool, RowDataPacket } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';

export class MYSQLShipmentRepository implements ShipmentRepositoryPort {

    constructor(private readonly pool: Pool) { }


    /**
     * Busca un Shipment por su ID.
     * @param id - El ID del Shipment a buscar.
     * @returns Una promesa que resuelve con el Shipment encontrado o null si no existe.
     */
    async findById(id: string): Promise<Shipment | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute<any[]>(`
            SELECT
                s.id,
                s.origin_id        AS originId,
                s.destination_id   AS destinationId,
                s.user_id          AS userId,
                s.parcel_weight    AS weight,
                s.parcel_length    AS length,
                s.parcel_width     AS width,
                s.parcel_height    AS height,
                s.chargeable_weight,
                s.price,
                s.current_state    AS state,
                s.created_at       AS createdAt,
                COALESCE(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                    'state',     sh.state,
                    'changedAt', sh.changed_at
                    )
                ),
                JSON_ARRAY()
                ) AS historyJson
            FROM shipments s
            INNER JOIN shipment_state_history sh
                ON sh.shipment_id = s.id
            WHERE s.id = ?
            GROUP BY s.id;
        `, [id]);

            if (rows.length === 0) {
                return null;
            }

            const r = rows[0];

            // Se construye el Parcel a partir de los datos almacenados en el Shipment
            const parcel = new Parcel(
                r.weight,
                r.length,
                r.width,
                r.height
            );
            parcel.setChargeableWeight(r.chargeable_weight);
            parcel.setPrice(r.price);

            // Se convierte el JSON de historial de estados a un array de objetos
            const historyArray: { state: string; changedAt: string }[] = JSON.parse(r.historyJson);
            const stateHistory: StateHistoryEntry[] = historyArray.map(entry => ({
                state: entry.state as ShipmentState,
                changedAt: new Date(entry.changedAt),
            }));

            // Se crea la entidad Shipment
            return new Shipment(
                r.id,
                r.originId,
                r.destinationId,
                r.userId,
                parcel,
                stateHistory,
                r.state as ShipmentState,
                r.createdAt
            );

        } finally {
            connection.release();
        }
    }

    /**
     * Busca un conjunto de Shipments por el id del usuario propietario.
     * @param userId - El id del usuario propietario de los Shipments.
     * @param page - El número de página a obtener.
     * @param count - La cantidad de Shipments por página.
     * @returns Una promesa que resuelve con un array de Shipments.
     */
    async findAllByUserIdPaginated(userId: string, page: number, count: number): Promise<Shipment[]> {
        const offset = page * count;
        const conn = await this.pool.getConnection();
        try {

            // Query paginada
            let rows: RowDataPacket[];
            const listSql = `SELECT
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
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                `;
            rows = (await conn.query<RowDataPacket[]>(listSql, [userId, count, offset]))[0];

            // Mapeo a Shipment
            const shipments: Shipment[] = rows.map(shipmentFound => {

                // Construye el Parcel a partir de los datos almacenados en el Shipment
                const parcel = new Parcel(
                    shipmentFound.weight,
                    shipmentFound.length,
                    shipmentFound.width,
                    shipmentFound.height
                );
                parcel.setChargeableWeight(shipmentFound.chargeable_weight);
                parcel.setPrice(shipmentFound.price);

                //Se Crea la entidad Shipment
                const shipment = new Shipment(
                    shipmentFound.id,
                    shipmentFound.originId,
                    shipmentFound.destinationId,
                    shipmentFound.userId,
                    parcel,
                    [],
                    shipmentFound.state as ShipmentState,
                    shipmentFound.createdAt
                );
                return shipment;
            });

            return shipments;
        } finally {
            conn.release();
        }
    }

    /**
     * Busca Shipments que han cambiado desde una fecha específica.
     * @param since - La fecha desde la cual buscar cambios.
     * @returns Una promesa que resuelve con un array de Shipments que han cambiado desde la fecha indicada.
     */
    async findChangedSince(since: Date): Promise<{ id: string; state: ShipmentState }[]> {
        const sinceUtc = new Date(since.getTime() + since.getTimezoneOffset() * 60000);
        const conn = await this.pool.getConnection();
        try {
            const [rows] = await conn.query<RowDataPacket[]>(
                `SELECT 
                        id,
                        current_state,
                        changed_at
                    FROM shipments
                    WHERE changed_at > ?
                    ORDER BY changed_at ASC`,
                [sinceUtc]
            );
            return rows.map(shipmentFound => {
                return { id: shipmentFound.id, state: shipmentFound.current_state as ShipmentState };
            });
        } finally {
            conn.release();
        }
    }

    /**
     * Actualiza el estado de un Shipment.
     * @param shipmentId - El id del Shipment a actualizar.
     * @param newState - El nuevo estado del Shipment.
     * @param changedAt - La fecha y hora en que se cambió el estado.
     * @returns Una promesa que se resuelve cuando el estado ha sido actualizado.
     */
    async updateState(shipmentId: string, newState: ShipmentState, changedAt: Date): Promise<void> {
        const conn = await this.pool.getConnection();
        try {

            /*
            * No se actualiza la tabla shipments, solo se inserta en el historial,
            * esto para evitar que se actualice el campo changed_at automáticamente
            * solo es para poder probar cambiando el estado del Shipment desde la DB
            */

            // Inserta el nuevo estado en el historial de estados del Shipment
            await conn.query(
                `INSERT INTO shipment_state_history (id, shipment_id, state, changed_at)
                 VALUES (?, ?, ?, ?)`,
                [uuid(), shipmentId, newState, changedAt]
            );
        } finally {
            conn.release();
        }
    }

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


}