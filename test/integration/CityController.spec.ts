
import express from 'express';
import request from 'supertest';
import { GetAllCitiesUseCase } from '../../src/application/usecase';
import { CityController } from '../../src/adapter/inbound/http';

// Extiende la interfaz Request para incluir 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

describe('CityController (integración)', () => {
  let app: express.Express;

  function buildApp(useCase: Partial<GetAllCitiesUseCase>) {
    const ctrl = new CityController(useCase as any);
    const server = express();

    server.use((req, _res, next) => {
      req.user = { id: 'test-user' };
      next();
    });
    
    server.get('/api/cities', (req, res, next) =>
      ctrl.getAllCities(req, res).catch(next)
    );
    return server;
  }

  it('GET /api/cities → 200 y retorna la lista de ciudades en caso exitoso', async () => {
    const fakeUC = { execute: jest.fn().mockResolvedValue([]) };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/cities')
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({ cities: [] });
        expect(fakeUC.execute).toHaveBeenCalled();
      });
  });

  it('GET /api/cities → 200 y retorna las un array de ciudades vacio', async () => {
    const fakeUC = { execute: jest.fn().mockResolvedValue([]) };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/cities')
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({ cities: [] });
        expect(fakeUC.execute).toHaveBeenCalled();
      });
  });

  it('GET /api/cities → 500 y retorna un error', async () => {
    const fakeUC = { execute: jest.fn().mockRejectedValue(new Error('Error interno')) };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/cities')
      .expect(500)
      .expect(res => {
        expect(res.body).toEqual({ error: "Error al obtener las ciudades" });
        expect(fakeUC.execute).toHaveBeenCalled();
      });
  });

});
