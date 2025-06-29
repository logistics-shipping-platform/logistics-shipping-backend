import request from 'supertest';
import express from 'express';
import { AuthenticateUserUseCase } from '../../src/application/usecase';
import { AuthController } from '../../src/adapter/inbound/http';

describe('AuthController (integración)', () => {
  let app: express.Express;

  function buildApp(useCase: Partial<AuthenticateUserUseCase>) {
    const ctrl = new AuthController(useCase as any);
    const server = express();
    server.use(express.json());
    server.post(
      '/api/auth/login',
      (req, res, next) => ctrl.login(req, res).catch(next)
    );
    return server;
  }

  it('POST /auth/login → 200 y retorna token en caso exitoso', async () => {
    const fakeUC = {
      execute: jest.fn().mockResolvedValue({ token: 'jwt-abc-123' })
    };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'u@d.com', password: 'validPass1' })
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({ token: 'jwt-abc-123' });
        expect(fakeUC.execute).toHaveBeenCalledWith({
          email: 'u@d.com',
          password: 'validPass1'
        });
      });
  });

  it('POST /auth/login → 401 y mensaje de error si falla el Use Case', async () => {
    const fakeUC = {
      execute: jest.fn().mockRejectedValue(new Error('Credenciales inválidas'))
    };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'u@d.com', password: 'wrongPass' })
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({ error: 'Credenciales inválidas' });
      });
  });

  it('POST /auth/login → 401 si ocurre un error no controlado', async () => {
    const fakeUC = {
      execute: jest.fn().mockRejectedValue(new Error('DB caída inesperada'))
    };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'u@d.com', password: 'whatever' })
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({ error: 'DB caída inesperada' });
      });
  });
});