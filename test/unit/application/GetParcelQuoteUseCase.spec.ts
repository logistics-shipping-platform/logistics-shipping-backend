import { ParcelQuoteDTO } from "../../../src/adapter/inbound/http";
import { GetParcelQuoteUseCase } from "../../../src/application/usecase";
import { Parcel } from "../../../src/domain/model/parcel";
import { ParcelService } from "../../../src/domain/service/ParcelService";

describe('GetParcelQuoteUseCase', () => {
  let parcelService: jest.Mocked<ParcelService>;
  let useCase: GetParcelQuoteUseCase;
  const dto: ParcelQuoteDTO = {
    originId: 'origin',
    destinationId: 'destination',
    weight: 10,
    length: 10,
    width: 10,
    height: 10,
  };

  beforeEach(() => {
    parcelService = { getQuote: jest.fn() } as any;
    useCase = new GetParcelQuoteUseCase(parcelService);
  });

  it('should call parcelService.getQuote with correct params and return the parcel', async () => {
    const mockParcel = new Parcel(5, 10, 10, 10);
    mockParcel.setChargeableWeight(mockParcel.calculateChargeableWeight(mockParcel));
    mockParcel.setPrice(100);

    parcelService.getQuote.mockResolvedValue(mockParcel);

    const result = await useCase.execute(dto);
    expect(mockParcel.getPrice()).toBe(100);
    expect(mockParcel.getChargeableWeight()).toBe(mockParcel.calculateChargeableWeight(mockParcel));
    expect(parcelService.getQuote).toHaveBeenCalledWith(
      dto.originId,
      dto.destinationId,
      dto.weight,
      dto.length,
      dto.width,
      dto.height
    );
    expect(result).toBe(mockParcel);
  });
});