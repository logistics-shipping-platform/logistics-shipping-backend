import { GetParcelQuoteUseCase } from "../../src/application/usecase";
import { ParcelController } from "../../src/adapter/inbound/http";
import express from 'express';
import request from 'supertest';

describe('ParcelController (integración)', () => {
  let app: express.Express;

  function buildApp(useCase: Partial<GetParcelQuoteUseCase>) {
    const ctrl = new ParcelController(useCase as any);
    const server = express();
    server.use(express.json());

    server.get('/api/parcel/quote', (req, res, next) =>
      ctrl.getFareValue(req, res).catch(next)
    );
    return server;
  }

  it('GET /api/parcel/quote → 200 y retorna chargeableWeight y price en caso exitoso', async () => {
    const fakeUC = {
      execute: jest.fn().mockResolvedValue({
        getChargeableWeight: () => 12,
        getPrice: () => 50000
      })
    };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/parcel/quote')
      .send({ originId: 'orig', destinationId: 'dest', weight: 1, length: 2, width: 3, height: 4 })
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({ chargeableWeight: 12, price: 50000 });
        expect(fakeUC.execute).toHaveBeenCalledWith({
          originId: 'orig',
          destinationId: 'dest',
          weight: 1,
          length: 2,
          width: 3,
          height: 4
        });
      });
  });

  it('GET /api/parcel/quote → 400 y mensaje de error sin originId', async () => {
    const fakeUC = { execute: jest.fn().mockRejectedValue(new Error('Error')) };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/parcel/quote')
      .send({ })
      .expect(400)
      .expect(res => {
        expect(res.body).toEqual({ error: 'originId inválido' });
      });
  });

  it('GET /api/parcel/quote → 400 y mensaje de error sin destinationId', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/parcel/quote')
      .send({
        originId: 'originTest'
      })
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error');
        expect(fakeUC.execute).not.toHaveBeenCalled();
      });
  });
  it('GET /api/parcel/quote → 400 y mensaje de error sin weight', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/parcel/quote')
      .send({
        originId: 'originTest',
        destinationId: 'destinationTest'
      })
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error');
        expect(fakeUC.execute).not.toHaveBeenCalled();
      });
  });

  it('GET /api/parcel/quote → 400 y mensaje de error sin length', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/parcel/quote')
      .send({
        originId: 'originTest',
        destinationId: 'destinationTest',
        weight: 1
      })
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error');
        expect(fakeUC.execute).not.toHaveBeenCalled();
      });
  });

  it('GET /api/parcel/quote → 400 y mensaje de error sin height', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/parcel/quote')
      .send({
        originId: 'originTest',
        destinationId: 'destinationTest',
        weight: 1,
        length: 2
      })
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error');
        expect(fakeUC.execute).not.toHaveBeenCalled();
      });
  });
  
  it('GET /api/parcel/quote → 400 y mensaje de error sin width', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .get('/api/parcel/quote')
      .send({
        originId: 'originTest',
        destinationId: 'destinationTest',
        weight: 1,
        length: 2,
        height: 3
      })
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error');
        expect(fakeUC.execute).not.toHaveBeenCalled();
      });
  });

});
