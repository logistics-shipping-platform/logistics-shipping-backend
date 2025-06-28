import 'dotenv/config';
import express from 'express';
import { pool } from './config/MysqlDatabase';

import { MySQLUserRepo } from './adapter/outbound/persistence/MysqlUserRepo';
import {
  BcryptHasher,
  JWTService
} from './adapter/outbound/auth';
import {
  AuthenticateUserUseCase,
  GetParcelQuoteUseCase,
  RegisterUserUseCase
} from './application/usecase';
import {
  AuthController,
  ParcelController,
  UserController
} from './adapter/inbound/http';
import { ParcelService } from './domain/service/ParcelService';

async function main() {
  const app = express();
  const port = process.env.API_GATEWAY_PORT || 3000;
  app.use(express.json());

  // Adapters outbound
  const userRepo = new MySQLUserRepo();
  const cityRepo = new MySQLCityRepository(pool);
  const hasher = new BcryptHasher();
  const jwtSvc = new JWTService();

  // Use case
  const authenticateUserUC = new AuthenticateUserUseCase(userRepo, hasher, jwtSvc);
  const registerUC = new RegisterUserUseCase(userRepo, hasher);
  const parcelService = new ParcelService(cityRepo);
  const getParcelQuoteUC = new GetParcelQuoteUseCase(parcelService);

  // Controllers
  const authCtrl = new AuthController(authenticateUserUC);
  const userCtrl = new UserController(registerUC);
  const parcelCtrl = new ParcelController(getParcelQuoteUC);
  app.post('/auth', authCtrl.login);
  app.post('/user', userCtrl.register);
  app.post('/quote', parcelCtrl.getQuote);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Error starting server:', err);
});