import 'dotenv/config';
import express, { NextFunction, Request, Response, RequestHandler } from 'express';
import { pool } from './config/MysqlDatabase';
import cors from 'cors';
import http from 'http';

import {
  BcryptHasher,
  JWTService
} from './adapter/outbound/auth';
import {
  AuthenticateUserUseCase,
  GetAllCitiesUseCase,
  GetParcelQuoteUseCase,
  RegisterUserUseCase
} from './application/usecase';
import {
  AuthController,
  CityController,
  ShipmentController,
  ParcelController,
  UserController
} from './adapter/inbound/http';
import { ParcelService } from './domain/service/ParcelService';
import jwt from 'jsonwebtoken';
import { MySQLCityRepository, MySQLUserRepo } from './adapter/outbound/persistence';
import { FareService } from './domain/service/FareService';
import { MySQLFareRepository } from './adapter/outbound/persistence/MySQLFareRepository';
import { CreateShipmentUseCase } from './application/usecase/shipment/CreateShipmentUseCase';
import { MYSQLShipmentRepository } from './adapter/outbound/persistence/MYSQLShipmentRepository';
import { GetShipmentByIdUseCase } from './application/usecase/shipment/GetShipmentByIdUseCase';
import { GetShipmentByUserIdPaginatedUseCase } from './application/usecase/shipment/GetShipmentByUserIdPaginatedUseCase';
import { SocketIONotificationAdapter } from './adapter/outbound/messaging/SocketIONotificationAdapter';
import { ChangeShipmentStateUseCase } from './application/usecase/shipment/ChangeShipmentStateUseCase';

const secret = process.env.JWT_SECRET!;

process.on('uncaughtException', err => {
  console.error('uncaughtException:', err);
});
process.on('unhandledRejection', err => {
  console.error('unhandledRejection:', err);
});

async function main() {
  const app = express();
  const port = process.env.API_GATEWAY_PORT || 3000;

  app.use(express.json());

  app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Middleware que se encarga de verificar el token JWT en las solicitudes (excepto en las rutas de login y registro)
  const authMiddleware: RequestHandler = (req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
      next();
    } else {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
      } else {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, secret) as { userId: string, email: string };
          req.user = { id: decoded.userId, email: decoded.email };
          next();
        } catch {
          res.status(401).json({ error: 'Invalid token' });
        }
      }
    }


  };
  app.use(authMiddleware);

  // Adapters
  const userRepo = new MySQLUserRepo();
  const cityRepo = new MySQLCityRepository(pool);
  const fareRepo = new MySQLFareRepository(pool);
  const shipmentRepo = new MYSQLShipmentRepository(pool);
  const hasher = new BcryptHasher();
  const jwtSvc = new JWTService();
  

  // Service
  const fareService = new FareService(fareRepo);
  const parcelService = new ParcelService(cityRepo, fareService);

  // Use case
  const authenticateUserUC = new AuthenticateUserUseCase(userRepo, hasher, jwtSvc);
  const registerUC = new RegisterUserUseCase(userRepo, hasher);
  const getParcelQuoteUC = new GetParcelQuoteUseCase(parcelService);
  const getAllCitiesUC = new GetAllCitiesUseCase(cityRepo);
  const createShipmentUC = new CreateShipmentUseCase(shipmentRepo);
  const getShipmentByIdUC = new GetShipmentByIdUseCase(shipmentRepo);
  const getShipmentByUserIdPaginatedUC = new GetShipmentByUserIdPaginatedUseCase(shipmentRepo);


  // Controllers
  const authCtrl = new AuthController(authenticateUserUC);
  const userCtrl = new UserController(registerUC);
  const parcelCtrl = new ParcelController(getParcelQuoteUC);
  const cityCtrl = new CityController(getAllCitiesUC);
  const shipmentCtrl = new ShipmentController(createShipmentUC, getShipmentByIdUC, getShipmentByUserIdPaginatedUC);

  // POSTS
  app.post('/api/auth/login', authCtrl.login);
  app.post('/api/auth/register', userCtrl.register);
  app.post('/api/parcels/quote', parcelCtrl.getFareValue);
  app.post('/api/shipments', shipmentCtrl.createShipment);

  // GETS
  app.get('/api/cities', cityCtrl.getAllCities);
  app.get('/api/shipments/:id', shipmentCtrl.getShipmentById);
  app.get('/api/shipments', shipmentCtrl.getShipmentsByUserIdPaginated);

  //Se crea un servidor HTTP y se configura el adaptador de notificaciones Socket.IO
  const server = http.createServer(app);
  const notifier = new SocketIONotificationAdapter(server);
  const changeStateUC = new ChangeShipmentStateUseCase(shipmentRepo, notifier);
  
  notifier.onConnection();

  // Middleware de Socket.IO para validar el JWT en el handshake
  notifier.getIo().use((socket, next) => {

    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('No token provided'));
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.data.userId = payload.userId;
      return next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  // Se configura el canal de Socket.IO para que los clientes puedan suscribirse a actualizaciones de envíos que solo le pertenecen a ellos
  notifier.getIo().on('connection', socket => {
    socket.on('subscribe', (channel: string) => {
      const [, shipmentId] = channel.split('.');
      if (socket.data.userId !== shipmentId) {
        return socket.emit('error', 'Not authorized');
      }
      socket.join(channel);
    });
  });

  // Inicia el watcher de envíos para emitir actualizaciones periódicas
  notifier.startShipmentWatcher(shipmentRepo, changeStateUC, parseInt(process.env.WS_WATCHER_TIMESTAMP || '3000'));

  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  server.on('error', err => {
    console.error('Server error:', err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Error starting server:', err);
});