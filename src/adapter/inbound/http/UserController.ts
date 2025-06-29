import { Request, Response } from 'express';

import { RegisterUserDTO } from './dto/RegisterUserDTO';
import { RegisterUserUseCase } from '../../../application/usecase';

export class UserController {
  constructor(private registerUC: RegisterUserUseCase) { }

  /**
   * Registrar un nuevo usuario.
   * @param req - contiene la información del usuario.
   * @param res - respuesta que contiene el id del usuario creado.
   * @returns {Promise<void>} - Resuelve cuando el usuario está registrado.
   */
  register = async (req: Request, res: Response) => {
    try {
      const dto = new RegisterUserDTO(req.body);
      const { userId } = await this.registerUC.execute(dto);
      res.status(201).json({ userId });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}