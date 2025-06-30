import { Request, Response } from 'express';
import { CreateShipmentUseCase } from '../../../application/usecase/shipment/CreateShipmentUseCase';
import { GetShipmentByIdUseCase } from '../../../application/usecase/shipment/GetShipmentByIdUseCase';
import { CreateShipmentDTO } from './dto/CreateShipmentDTO';

export class ShipmentController {
    constructor(private createShipmentUC: CreateShipmentUseCase, private getShipmentByIdUC: GetShipmentByIdUseCase) { }

    /**
     * Crea un nuevo envío.
     * @param req - Contiene la información de la solicitud.
     * @param res - Respuesta que contiene el id del envío creado.
     * @returns {Promise<void>}
     */
    createShipment = async (req: Request, res: Response) => {
        try {

            const dto = new CreateShipmentDTO({ ...req.body, userId: req?.user?.id });
            const shipment = await this.createShipmentUC.execute(dto);
            res.status(201).json(shipment);

        } catch (err: any) {
            res.status(400).json({ error: err.message });
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
            const shipmentId = req.params.id.trim();
            const shipment = await this.getShipmentByIdUC.execute(shipmentId);
            if (!shipment) {
                res.status(404).json({ error: 'El envío no fue encontrado' });
                return;
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
                state: shipment.getState()
            });
        } catch (err: any) {
            res.status(500).json({ error: 'Error al obtener el envío' });
        }
    }
}