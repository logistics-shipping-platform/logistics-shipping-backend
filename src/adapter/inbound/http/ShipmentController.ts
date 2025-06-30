import { Request, Response } from 'express';
import { CreateShipmentUseCase } from '../../../application/usecase/shipment/CreateShipmentUseCase';
import { GetShipmentByIdUseCase } from '../../../application/usecase/shipment/GetShipmentByIdUseCase';
import { GetShipmentByUserIdPaginatedUseCase } from '../../../application/usecase/shipment/GetShipmentByUserIdPaginatedUseCase';
import { CreateShipmentDTO } from './dto/CreateShipmentDTO';
import { GetShipmentByUserIdPaginatedDTO } from './dto/GetShipmentByUserIdPaginatedDTO';

export class ShipmentController {
    constructor(private createShipmentUC: CreateShipmentUseCase, private getShipmentByIdUC: GetShipmentByIdUseCase, private getShipmentByUserIdPaginatedUC: GetShipmentByUserIdPaginatedUseCase) { }

    /**
     * Crea un nuevo envío.
     * @param req - Contiene la información de la solicitud.
     * @param res - Respuesta que contiene el id del envío creado.
     * @returns {Promise<void>}
     */
    createShipment = async (req: Request, res: Response) => {
        try {

            let createDto;
            try {
                // Se obtienen los datos del request y se crea el DTO para verificar la integridad de los datos
                const userId = req?.user?.id ?? "";
                const { page, count } = req.query;
                createDto = new CreateShipmentDTO({ ...req.body, userId });
            }
            catch (err: any) {
                res.status(400).json({ error: err.message });
                return;
            }
            const shipment = await this.createShipmentUC.execute(createDto);
            res.status(201).json(shipment);

        } catch (err: any) {
            res.status(500).json({ error: 'Error al crear el envío, por favor intente nuevamente' });
        }
    }

    /**
     * Obtiene un envío por su ID.
     * @param req - Contiene el ID del envío en los parámetros de la solicitud.
     * @param res - Respuesta que contiene el envío encontrado.
     * @returns {Promise<void>}
     */
    getShipmentById = async (req: Request, res: Response) => {
        try {
            const userId = req?.user?.id ?? "";
            const shipmentId = req.params.id.trim();
            const shipment = await this.getShipmentByIdUC.execute(shipmentId);

            // Verifica si el envío fue encontrado
            if (shipment === null) {
                res.status(404).json({ error: 'El envío no fue encontrado' });
                return;
            }

            // Verifica si el usuario es el propietario del envío
            if (userId !== shipment.getUserId()) {
                throw new Error('No tienes permiso para ver este envío');
            }

            res.status(200).json({
                id: shipment.getId(),
                originId: shipment.getOriginId(),
                destinationId: shipment.getDestinationId(),
                userId: shipment.getUserId(),
                weight: shipment.getParcel().getWeight(),
                length: shipment.getParcel().getLength(),
                width: shipment.getParcel().getWidth(),
                height: shipment.getParcel().getHeight(),
                chargeableWeight: shipment.getParcel().getChargeableWeight(),
                price: shipment.getParcel().getPrice(),
                stateHistory: shipment.getStateHistory(),
                createdAt: shipment.getCreatedAt(),
                state: shipment.getState()
            });
        } catch (err: any) {
            res.status(500).json({ error: 'Error al obtener el envío' });
        }
    }

    /**
     * Obtiene los envíos de un usuario paginados.
     * @param req - Contiene la información del usuario y los parámetros de paginación.
     * @param res - Respuesta que contiene los envíos encontrados.
     * @returns {Promise<void>}
     */
    getShipmentsByUserIdPaginated = async (req: Request, res: Response) => {
        try {
            let findDto;
            try {
                // Se obtienen los datos del request y se crea el DTO para verificar la integridad de los datos
                const userId = req?.user?.id ?? "";
                const { page, count } = req.query;
                findDto = new GetShipmentByUserIdPaginatedDTO({
                    userId,
                    page,
                    count
                });
            }
            catch (err: any) {
                res.status(400).json({ error: err.message });
                return;
            }

            // Se ejecuta el caso de uso para obtener los envíos paginados
            const shipments = await this.getShipmentByUserIdPaginatedUC.execute(findDto);

            res.status(200).json(shipments);
        } catch (err: any) {
            res.status(500).json({ error: 'Error al obtener los envíos' });
        }
    }
}