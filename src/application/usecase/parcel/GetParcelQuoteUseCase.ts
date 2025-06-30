import { ParcelQuoteDTO } from "../../../adapter/inbound/http";
import { ParcelService } from "../../../domain/service/ParcelService";


export class GetParcelQuoteUseCase {
  constructor(private parcelService: ParcelService) {}

  /**
   * Obtiene la cotización de un envío de paquete basado en sus dimensiones y peso.
   * @param dto - Objeto DTO que contiene los datos necesarios para calcular la cotización.
   * @returns Una promesa que resuelve con el valor de la cotización.
   */
  async execute(dto: ParcelQuoteDTO) {

    return await this.parcelService.getFareValue(
      dto.originId,
      dto.destinationId,
      dto.weight,
      dto.length,
      dto.width,
      dto.height
    );
  }
}