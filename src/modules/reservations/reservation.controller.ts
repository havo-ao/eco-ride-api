import { Request, Response, NextFunction } from "express";
import { ReservationService, ReservationError } from "./reservation.service";
import { childLogger } from '@/core/logger/logger';

const logger = childLogger('reservations-controller');

interface AuthUser {
  id: number;
}

interface AuthRequest extends Request {
  user?: AuthUser;
}

const service = new ReservationService();

export class ReservationController {
  static async getActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }
  const result = await service.getActive(userId);
  logger.info({ message: 'Reserva Activa', result, userId });
  return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const { stationId, bikeType } = req.body;
      if (!stationId) {
        return res.status(400).json({ message: "stationId es obligatorio" });
      }
      const result = await service.create(userId, Number(stationId), bikeType);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof ReservationError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return next(error);
    }
  }

  static async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const reservationId = Number(req.params.id);
      if (!reservationId) {
        return res.status(400).json({ message: "Id de reserva inválido" });
      }
      const result = await service.cancel(reservationId, userId);
      return res.json(result);
    } catch (error) {
      if (error instanceof ReservationError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return next(error);
    }
  }
}
