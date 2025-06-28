import { AuthenticateUserUseCase } from "../../../src/application/usecase";

describe('AuthenticateUserUseCase', () => {
  const fakeUser = { id: '1', email: 'a@b.com', passwordHash: 'hash' };
  const userRepo = { findByEmail: jest.fn() };
  const hasher   = { compare: jest.fn() };
  const tokenSvc = { generate: jest.fn().mockResolvedValue('tok') };
  const uc = new AuthenticateUserUseCase(userRepo as any, hasher as any, tokenSvc as any);

  it('no existe usuario', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    await expect(uc.execute({ email: 'x', password: 'y' }))
      .rejects.toThrow('Credenciales inválidas');
  });

  it('falla compare', async () => {
    userRepo.findByEmail.mockResolvedValue(fakeUser);
    hasher.compare.mockResolvedValue(false);
    await expect(uc.execute({ email: 'x', password: 'y' }))
      .rejects.toThrow('Credenciales inválidas');
  });

  it('devuelve token si todo OK', async () => {
    userRepo.findByEmail.mockResolvedValue(fakeUser);
    hasher.compare.mockResolvedValue(true);
    const result = await uc.execute({ email: 'x', password: 'y' });
    expect(result).toEqual({ token: 'tok' });
    expect(tokenSvc.generate).toHaveBeenCalledWith({ sub: '1', email: 'a@b.com' });
  });
});