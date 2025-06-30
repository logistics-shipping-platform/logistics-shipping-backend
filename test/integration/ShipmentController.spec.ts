import { ShipmentController } from "../../src/adapter/inbound/http";
import express from 'express';
import request from 'supertest';

import { GetShipmentByIdUseCase } from "../../src/application/usecase/shipment/GetShipmentByIdUseCase";
import { GetShipmentByUserIdPaginatedUseCase } from "../../src/application/usecase/shipment/GetShipmentByUserIdPaginatedUseCase";
import { CreateShipmentUseCase } from "../../src/application/usecase/shipment/CreateShipmentUseCase";

import { Parcel } from "../../src/domain/model/parcel";
import { Shipment, ShipmentState, StateHistoryEntry } from "../../src/domain/model/shipment";


declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

describe('ShipmentController (integración)', () => {
  let app: express.Express;

  function buildApp(createUseCase: Partial<CreateShipmentUseCase>, getByIdUseCase: Partial<GetShipmentByIdUseCase>, getByUserPaginated: Partial<GetShipmentByUserIdPaginatedUseCase>, withUserId = true, withInvalidUserId = false) {
    const ctrl = new ShipmentController(createUseCase as any, getByIdUseCase as any, getByUserPaginated as any);
    const server = express();
    server.use(express.json());

    server.use((req, _res, next) => {
      req.user = { id: withUserId ? (withInvalidUserId ? 'invalid-user-id' : 'dc7fc307-8da0-47ac-a068-0e130f44aa97') : '' };
      next();
    });

    server.post('/api/shipments', (req, res, next) =>
      ctrl.createShipment(req, res).catch(next)
    );

    server.get('/api/shipments/:id', (req, res, next) =>
      ctrl.getShipmentById(req, res).catch(next)
    );

    server.get('/api/shipments', (req, res, next) =>
      ctrl.getShipmentsByUserIdPaginated(req, res).catch(next)
    );

    return server;
  }

  let createFakeUC = {
    execute: jest.fn().mockResolvedValue({
      shipmentId: "2e3a1164-62f2-4d26-a674-9333fddd780a"
    })
  };

  const parcel = new Parcel(1, 22, 16, 11);
  parcel.setChargeableWeight(2);
  parcel.setPrice(4500);

  const stateHistory: StateHistoryEntry[] = [{
    state: ShipmentState.WAITING,
    changedAt: new Date("2025-06-29T23:46:26.000Z")
  }];

  let getByUserPaginatedFakeUC = {
    execute: jest.fn().mockResolvedValue([{
      "chargeableWeight": 2,
      "destinationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "height": 11,
      "id": "86779142-2bae-4264-aee6-ac7bb69bd085",
      "length": 22,
      "originId": "11111111-1111-1111-1111-111111111111",
      "price": 4500,
      "state": "WAITING",
      "createdAt": "2025-06-29T23:46:26.000Z",
      "weight": 1,
      "width": 16
    }])
  };


  let getFakeUC = {
    execute: jest.fn().mockResolvedValue(
      new Shipment(
        "86779142-2bae-4264-aee6-ac7bb69bd085",
        "11111111-1111-1111-1111-111111111111",
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "dc7fc307-8da0-47ac-a068-0e130f44aa97",
        parcel,
        stateHistory,
        ShipmentState.WAITING,
        new Date("2025-06-29T23:46:26.000Z")
      )
    )
  };

  // Tests para la creación de envíos
  describe('POST /api/shipments', () => {

    it('POST /api/shipments → 201 y retorna el envío creado en caso exitoso', async () => {

      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);

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
      createFakeUC = { execute: jest.fn() };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);

      await request(app)
        .post('/api/shipments')
        .send({

        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(createFakeUC.execute).not.toHaveBeenCalled();
        });
    });

    it('POST /api/shipments → 400 y mensaje de error sin destinationId', async () => {
      createFakeUC = { execute: jest.fn() };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);

      await request(app)
        .post('/api/shipments')
        .send({
          originId: 'originTest'
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(createFakeUC.execute).not.toHaveBeenCalled();
        });
    });

    it('POST /api/shipments → 400 y mensaje de error sin weight', async () => {
      createFakeUC = { execute: jest.fn() };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);

      await request(app)
        .post('/api/shipments')
        .send({
          originId: 'originTest',
          destinationId: 'destinationTest'
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(createFakeUC.execute).not.toHaveBeenCalled();
        });
    });

    it('POST /api/shipments → 400 y mensaje de error sin length', async () => {
      createFakeUC = { execute: jest.fn() };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);

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
          expect(createFakeUC.execute).not.toHaveBeenCalled();
        });
    });

    it('POST /api/shipments → 400 y mensaje de error sin price', async () => {
      createFakeUC = { execute: jest.fn() };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);

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
          expect(createFakeUC.execute).not.toHaveBeenCalled();
        });
    });

    it('POST /api/shipments → 400 y mensaje de error sin userId', async () => {
      createFakeUC = { execute: jest.fn() };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC, false);

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
          expect(createFakeUC.execute).not.toHaveBeenCalled();
        });
    });

    it('POST /api/shipments → 500 y mensaje de error al crear el envio', async () => {
      createFakeUC = { execute: jest.fn().mockRejectedValue(new Error('Error al crear el envío')) };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);

      await request(app)
        .post('/api/shipments')
        .send({
          originId: 'originTest',
          destinationId: 'destinationTest',
          weight: 1,
          length: 1,
          width: 1,
          height: 1,
          chargeableWeight: 1,
          price: 1000
        })
        .expect(500)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
        });
    });

  });

  // Tests para obtener un envío por ID
  describe('GET /api/shipments/:id', () => {

    it('GET /api/shipments/:id → 200 y retorna el envío encontrado', async () => {
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);
      await request(app)
        .get('/api/shipments/86779142-2bae-4264-aee6-ac7bb69bd085')
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual({
            id: "86779142-2bae-4264-aee6-ac7bb69bd085",
            originId: "11111111-1111-1111-1111-111111111111",
            destinationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            userId: "dc7fc307-8da0-47ac-a068-0e130f44aa97",
            weight: 1,
            length: 22,
            width: 16,
            height: 11,
            chargeableWeight: 2,
            price: 4500,
            stateHistory: [
              {
                state: "WAITING",
                changedAt: "2025-06-29T23:46:26.000Z"
              }
            ],
            state: "WAITING",
            createdAt: "2025-06-29T23:46:26.000Z"
          });
        });
    });

    it('GET /api/shipments/:id → 500 y retorna un error si el envio no le pertenece al usuario', async () => {
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC, true, true);
      await request(app)
        .get('/api/shipments/wrong-id')
        .expect(500)
        .expect(res => {
          expect(res.body).toEqual({
            error: "Error al obtener el envío"
          });
        });
    });

    it('GET /api/shipments/:id → 404 y retorna un error si el envio no fue encontrado', async () => {
      getFakeUC = {
        execute: jest.fn().mockResolvedValue(null)
      };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);
      await request(app)
        .get('/api/shipments/wrong-id')
        .expect(404)
        .expect(res => {
          expect(res.body).toEqual({
            error: "El envío no fue encontrado"
          });
        });
    });


    it('GET /api/shipments/:id → 500 error interno', async () => {
      getFakeUC = {
        execute: jest.fn().mockRejectedValue(new Error('Error al obtener el envío'))
      };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);
      await request(app)
        .get('/api/shipments/wrong-id')
        .expect(500)
        .expect(res => {
          expect(res.body).toEqual({
            error: "Error al obtener el envío"
          });
        });
    });

  });

  // Tests para obtener envíos paginados por usuario
  describe('GET /api/shipments', () => {


    it('GET /api/shipments/ → 200 y retorna los envíos encontrados', async () => {
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);
      await request(app)
        .get('/api/shipments')
        .query({ page: 0, count: 10 })
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual([{
            "chargeableWeight": 2,
            "destinationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            "height": 11,
            "id": "86779142-2bae-4264-aee6-ac7bb69bd085",
            "length": 22,
            "originId": "11111111-1111-1111-1111-111111111111",
            "price": 4500,
            "state": "WAITING",
            "createdAt": "2025-06-29T23:46:26.000Z",
            "weight": 1,
            "width": 16
          }]);
        });
    });


    it('GET /api/shipments/ → 200 y la lista vacia ', async () => {
      getByUserPaginatedFakeUC = {
        execute: jest.fn().mockResolvedValue([])
      };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);
      await request(app)
        .get('/api/shipments')
        .query({ page: 1, count: 10 })
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual([]);
        });
    });

    it('GET /api/shipments/ → 400 y mensaje de error page invalido', async () => {
      getByUserPaginatedFakeUC = {
        execute: jest.fn().mockResolvedValue([])
      };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);
      await request(app)
        .get('/api/shipments')
        .query({ page: "invalid", count: 10 })
        .expect(400)
        .expect(res => {
          expect(res.body).toEqual({
            error: "page inválido"
          });
        });
    });

    it('GET /api/shipments/ → 400 y mensaje de error count invalido', async () => {
      getByUserPaginatedFakeUC = {
        execute: jest.fn().mockResolvedValue([])
      };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);
      await request(app)
        .get('/api/shipments')
        .query({ page: 0, count: "invalid" })
        .expect(400)
        .expect(res => {
          expect(res.body).toEqual({
            error: "count inválido"
          });
        });
    });

    it('GET /api/shipments/ → 400 y mensaje de error userId invalido', async () => {
      getByUserPaginatedFakeUC = {
        execute: jest.fn().mockResolvedValue([])
      };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC, false);
      await request(app)
        .get('/api/shipments')
        .query({ page: 0, count: 10 })
        .expect(400)
        .expect(res => {
          expect(res.body).toEqual({
            error: "userId inválido"
          });
        });
    });

    it('GET /api/shipments/ → 400 y mensaje de error count invalido', async () => {
      getByUserPaginatedFakeUC = {
        execute: jest.fn().mockRejectedValue(new Error('Error al consultar los envíos'))
      };
      app = buildApp(createFakeUC, getFakeUC, getByUserPaginatedFakeUC);
      await request(app)
        .get('/api/shipments')
        .query({ page: 0, count: 10 })
        .expect(500)
        .expect(res => {
          expect(res.body).toEqual({
            error: "Error al obtener los envíos"
          });
        });
    });

  });


});


