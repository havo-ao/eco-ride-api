import { Request, Response } from 'express';
import { registerUserService } from '../services/register.service';

export async function registerUserController(req: Request, res: Response) {
  try {
    const result = await registerUserService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor' });
    console.error('Error en registerUserController:', error);
  }
}