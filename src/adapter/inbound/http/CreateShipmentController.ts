import { Request, Response } from 'express';
import { CreateShipmentUseCase } from '../../../application/usecase/shipment/CreateShipmentUseCase';
import { CreateShipmentDTO } from './dto/CreateShipmentDTO';

export class CreateShipmentController {
    constructor(private createShipmentUC: CreateShipmentUseCase) { }

    /**
     * Crea un nuevo envío.
     * @param req - Contiene la información de la solicitud.
     * @param res - Respuesta que contiene el id del envío creado.
     * @returns {Promise<void>}
     */
    createShipment = async (req: Request, res: Response) => {
        try {
            if (!req?.user?.id) {
                res.status(401).json({ error: 'Unauthorized' });
            } else {
                const dto = new CreateShipmentDTO({ ...req.body, userId: req.user.id });
                const shipment = await this.createShipmentUC.execute(dto);
                res.status(201).json(shipment);
            }
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}