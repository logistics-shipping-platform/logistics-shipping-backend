import { City } from "../../../domain/model/city";
import { GetCitiesPort } from "../../../domain/port/inbound";
import { CachePort, CityRepositoryPort } from "../../../domain/port/outbound";

export class GetAllCitiesUseCase implements GetCitiesPort {
  private readonly cacheKey = 'all_cities';
  private readonly cacheTTL = parseInt(process.env.CACHE_CITY_TTL || '3600');
  constructor(
    private cityRepository: CityRepositoryPort,
    private cache: CachePort
  ) { }

  /**
   * Obtiene todas las ciudades.
   * @return {Promise<City[]>}
   */
  async execute(): Promise<{ id: string, name: string }[]> {
    // Primero, intenta obtener las ciudades desde la caché
    const cached = await this.cache.get<{ id: string, name: string }[]>(this.cacheKey);
    if (cached) {
      return cached;
    }

    // Si no están en caché, obtén las ciudades desde el repositorio
    const cities = await this.cityRepository.getCities();

    const projectedCities = (cities ?? []).map(city => ({ id: city.getId(), name: city.getName() }));

    // Almacena las ciudades en la caché para futuras solicitudes
    await this.cache.set(this.cacheKey, projectedCities, this.cacheTTL);
    return projectedCities ?? [];
  }
}