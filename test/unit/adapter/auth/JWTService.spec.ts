import { JWTService } from "../../../../src/adapter/outbound/auth";
process.env.JWT_SECRET = 'test-secret';

describe('JWTService', () => {
  const jwtService = new JWTService();
  const payload = { email: 'danieltu1026@gmail.com' };
  const secret = 'mysecret';

  it('genera jwt y verifica si es valido', async () => {
    const token = await jwtService.generate(payload);
    expect(token).toBeDefined();
    const decoded = await jwtService.verify(token);
    expect(decoded).toMatchObject(payload);
  });

  it('falla la verificación con un token inválido', async () => {
    const token = 'invalid-token';
    const decoded = await jwtService.verify(token);
    expect(decoded).toBeNull();
  });
});