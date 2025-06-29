import { ParcelQuoteDTO } from "../../../adapter/inbound/http";
import { ParcelService } from "../../../domain/service/ParcelService";


export class GetParcelQuoteUseCase {
  constructor(private parcelService: ParcelService) {}

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