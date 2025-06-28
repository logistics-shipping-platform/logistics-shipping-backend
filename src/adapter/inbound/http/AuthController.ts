import { Request, Response } from 'express';
import { AuthenticateUserUseCase } from '../../../application/usecase';


export class AuthController {
  constructor(private authUC: AuthenticateUserUseCase) {}

  login = async (req: Request, res: Response) => {
    try {
      const { token } = await this.authUC.execute(req.body);
      res.json({ token });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  };
}