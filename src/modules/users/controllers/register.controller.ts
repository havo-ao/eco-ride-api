import { Request, Response } from 'express';
import { registerUserService } from '../services/register.service';
import { childLogger } from '@/core/logger/logger';

const logger = childLogger('users-controller');

export async function registerUserController(req: Request, res: Response) {
  try {
    const result = await registerUserService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor' });
    logger.error({ message: 'Error en registerUserController', error: (error as Error).message, stack: (error as Error).stack });
  }
}