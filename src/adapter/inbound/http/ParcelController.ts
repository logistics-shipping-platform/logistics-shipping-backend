import { Request, Response } from 'express';
import { GetParcelQuoteUseCase } from '../../../application/usecase';
import { ParcelQuoteDTO } from './dto/ParcelQuoteDTO';


export class ParcelController {
  constructor(private getParcelQuoteUC: GetParcelQuoteUseCase) { }

  /**
   * Obtiene la cotización de un paquete.
   * @param req - Contiene la información de la solicitud.
   * @param res - Respuesta que contiene el peso y precio del paquete.
   * @returns {Promise<void>}
   */
  getFareValue = async (req: Request, res: Response) => {
    try {
      const dto = new ParcelQuoteDTO(req.body);
      const parcel = await this.getParcelQuoteUC.execute(dto);
      res.json({
        chargeableWeight: parcel.getChargeableWeight(),
        price: parcel.getPrice()
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
