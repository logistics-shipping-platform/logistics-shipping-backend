import { City } from "../../../domain/model/city";
import { GetCitiesPort } from "../../../domain/port/inbound";
import { CityRepositoryPort } from "../../../domain/port/outbound";

export class GetAllCitiesUseCase implements GetCitiesPort {
  constructor(
    private cityRepository: CityRepositoryPort
  ) { }

  /**
   * Obtiene todas las ciudades.
   * @return {Promise<City[]>}
   */
  async execute(): Promise<City[]> {
    const cities = await this.cityRepository.getCities();
    return cities ?? [];
  }
}