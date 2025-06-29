import { CreateShipmentUseCase } from "../../src/application/usecase/shipment/CreateShipmentUseCase";
import { CreateShipmentController, ParcelController } from "../../src/adapter/inbound/http";
import express from 'express';
import request from 'supertest';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

describe('ParcelController (integración)', () => {
  let app: express.Express;

  function buildApp(useCase: Partial<CreateShipmentUseCase>) {
    const ctrl = new CreateShipmentController(useCase as any);
    const server = express();
    server.use(express.json());

    server.use((req, _res, next) => {
      req.user = { id: 'test-user' };
      next();
    });

    server.post('/api/shipments', (req, res, next) =>
      ctrl.createShipment(req, res).catch(next)
    );
    return server;
  }

  it('POST /api/shipments → 201 y retorna el envío creado en caso exitoso', async () => {
    const fakeUC = {
      execute: jest.fn().mockResolvedValue({
        shipmentId: "2e3a1164-62f2-4d26-a674-9333fddd780a"
      })
    };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/shipments')
      .send(
        {
          "originId": "11111111-1111-1111-1111-111111111111",
          "destinationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "weight": 0.1,
          "length": 33,
          "width": 16,
          "height": 15,
          "chargeableWeight": 4,
          "price": 4500
        }
      )
      .expect(201)
      .expect(res => {
        expect(res.body).toEqual({
          shipmentId: "2e3a1164-62f2-4d26-a674-9333fddd780a"
        });
      });
  });
  
  it('POST /api/shipments → 400 y mensaje de error sin originId', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/shipments')
      .send({
        
      })
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error');
        expect(fakeUC.execute).not.toHaveBeenCalled();
      });
  });

  it('POST /api/shipments → 400 y mensaje de error sin destinationId', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/shipments')
      .send({
        originId: 'originTest'
      })
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error');
        expect(fakeUC.execute).not.toHaveBeenCalled();
      });
  });

  it('POST /api/shipments → 400 y mensaje de error sin weight', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/shipments')
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

  it('POST /api/shipments → 400 y mensaje de error sin length', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/shipments')
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

  it('POST /api/shipments → 400 y mensaje de error sin price', async () => {
    const fakeUC = { execute: jest.fn() };
    app = buildApp(fakeUC);

    await request(app)
      .post('/api/shipments')
      .send({
        originId: 'originTest',
        destinationId: 'destinationTest',
        weight: 1,
        length: 1,
        width: 1,
        height: 1,
        chargeableWeight: 1
      })
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error');
        expect(fakeUC.execute).not.toHaveBeenCalled();
      });
  });

});
