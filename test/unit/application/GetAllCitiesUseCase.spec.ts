import { GetAllCitiesUseCase } from "../../../src/application/usecase";
import { City } from "../../../src/domain/model/city";
import { CachePort, CityRepositoryPort } from "../../../src/domain/port/outbound";


describe('GetAllCitiesUseCase', () => {

  const cityRepo = { getCities: jest.fn(), getCity: jest.fn() };
  const cachePort = { get: jest.fn(), set: jest.fn() };
  const useCase = new GetAllCitiesUseCase(cityRepo as any, cachePort as any);

  it('No se encuentran ciudades', async () => {
    cityRepo.getCities.mockResolvedValue(null);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('Se encuentran las ciudades y las retorna', async () => {
    const city = new City('1', 'City 1');
    jest.spyOn(cityRepo, 'getCities').mockResolvedValue([city]);

    const result = await useCase.execute();

    expect(result).toEqual([
          { id: '1', name: 'City 1' }
        ]);
  });

  it('debe devolver desde cache y no llamar al repositorio', async () => {
    const fakeCities = [
      { id: '1', name: 'City 1' },
    ];
    const cache: Partial<CachePort> = {
      get: jest.fn().mockResolvedValue(fakeCities),
      set: jest.fn(),
    };
    const repo: Partial<CityRepositoryPort> = {
      getCities: jest.fn(),
    };
    const useCase = new GetAllCitiesUseCase(
      repo as CityRepositoryPort,
      cache as CachePort
    );

    const result = await useCase.execute();

    expect(cache.get).toHaveBeenCalledWith('all_cities');
    expect(result).toEqual(fakeCities);
    expect(repo.getCities).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });
});