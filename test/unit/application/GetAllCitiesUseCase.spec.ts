import { GetAllCitiesUseCase } from "../../../src/application/usecase";


describe('GetAllCitiesUseCase', () => {

  const cityRepo = { getCities: jest.fn(), getCity: jest.fn() };
  const useCase = new GetAllCitiesUseCase(cityRepo as any);

  it('No se encuentran ciudades', async () => {
    cityRepo.getCities.mockResolvedValue(null);
    await expect(useCase.execute())
        .resolves.toEqual([]);
  });

  it('Se encuentran las ciudades y las retorna', async () => {
    cityRepo.getCities.mockResolvedValue([
      { id: '1', name: 'City A' },
      { id: '2', name: 'City B' }
    ]);
    await expect(useCase.execute())
        .resolves.toEqual([
          { id: '1', name: 'City A' },
          { id: '2', name: 'City B' }
        ]);
  });
});