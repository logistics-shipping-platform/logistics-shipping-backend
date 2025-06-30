import { Shipment, ShipmentState } from "../../model/shipment";


export interface ShipmentRepositoryPort {

  /**
   * Busca un Shipment por su ID.
   * @param id - El ID del Shipment a buscar.
   * @returns Una promesa que resuelve con el Shipment encontrado o null si no existe.
   */
  findById(id: string): Promise<Shipment | null>;

  /**
   * Busca un conjunto de Shipments por el id del usuario propietario.
   * @param userId - El id del usuario propietario de los Shipments.
   * @param page - El número de página a obtener.
   * @param count - La cantidad de Shipments por página.
   * @returns Una promesa que resuelve con un array de Shipments.
   */
  findAllByUserIdPaginated(userId: string, page: number, count: number): Promise<Shipment[]>;

  /**
   * Busca los ids y estados de los Shipments que han cambiado desde una fecha específica.
   * @param since - La fecha desde la cual buscar cambios.
   * @returns Una promesa que resuelve con un array de objetos que contienen el id y el estado de los Shipments que han cambiado desde la fecha indicada.
   */
  findChangedSince(since: Date): Promise<{ id: string; state: ShipmentState }[]>;

  /**
   * Actualiza el estado de un Shipment.
   * @param shipmentId - El id del Shipment a actualizar.
   * @param newState - El nuevo estado del Shipment.
   * @param changedAt - La fecha y hora en que se cambió el estado.
   * @returns Una promesa que se resuelve cuando el estado ha sido actualizado.
   */
  updateState(shipmentId: string, newState: ShipmentState, changedAt: Date): Promise<void>;

  /**
   * Crea un nuevo Shipment en el repositorio.
   * @param shipment - El objeto Shipment a guardar.
   * @returns Una promesa que se resuelve cuando el Shipment ha sido guardado.
   */
  create(shipment: Shipment): Promise<void>;
}