import 'dotenv/config';
import express from 'express';

import { MySQLUserRepo } from './adapter/outbound/persistence/MysqlUserRepo';
import { 
  BcryptHasher, 
  JWTService 
} from './adapter/outbound/auth';
import { 
  AuthenticateUserUseCase
 } from './application/usecase';
import { 
  AuthController 
} from './adapter/inbound/http';

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(express.json());

  // Adapters outbound
  const userRepo = new MySQLUserRepo();
  const hasher   = new BcryptHasher();
  const jwtSvc   = new JWTService();

  // Use case
  const authenticateUserUC = new AuthenticateUserUseCase(userRepo, hasher, jwtSvc);

  // Controllers
  const authController = new AuthController(authenticateUserUC);
  app.post('/auth', authController.login);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Error starting server:', err);
});