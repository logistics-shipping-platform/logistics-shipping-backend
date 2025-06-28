import 'dotenv/config';
import express from 'express';
import { pool } from './config/MysqlDatabase';
import cors from 'cors';

import { MySQLUserRepo } from './adapter/outbound/persistence/MysqlUserRepo';
import {
  BcryptHasher,
  JWTService
} from './adapter/outbound/auth';
import {
  AuthenticateUserUseCase,
  RegisterUserUseCase
} from './application/usecase';
import {
  AuthController,
  UserController
} from './adapter/inbound/http';

async function main() {
  const app = express();
  const port = process.env.API_GATEWAY_PORT || 3000;
  app.use(express.json());
  app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

  // Adapters outbound
  const userRepo = new MySQLUserRepo();
  const hasher = new BcryptHasher();
  const jwtSvc = new JWTService();

  // Use case
  const authenticateUserUC = new AuthenticateUserUseCase(userRepo, hasher, jwtSvc);
  const registerUC = new RegisterUserUseCase(userRepo, hasher);

  // Controllers
  const authCtrl = new AuthController(authenticateUserUC);
  const userCtrl = new UserController(registerUC);
  app.post('/api/auth/login', authCtrl.login);
  app.post('/api/auth/register', userCtrl.register);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Error starting server:', err);
});