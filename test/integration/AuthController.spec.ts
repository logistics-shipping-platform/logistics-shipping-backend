import request from 'supertest';
import express from 'express';
import { AuthController } from '../../src/adapter/inbound/http';

describe('AuthController (integración)', () => {
  let app: express.Express;

  beforeAll(() => {
    const fakeUC = { execute: jest.fn().mockResolvedValue({ token: 'tok' }) };
    const ctrl   = new AuthController(fakeUC as any);
    app = express();
    app.use(express.json());
    app.post('/auth/login', ctrl.login);
  });

  it('POST /auth/login 200 OK', async () => {
    await request(app)
      .post('/auth/login')
      .send({ email: 'x@x.com', password: 'pass1234' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.token).toBe('tok');
      });
  });
});