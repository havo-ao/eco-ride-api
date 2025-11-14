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
/**
 * @swagger
 * /api/reservations/active:
 *   get:
 *     summary: Obtener reserva activa del usuario
 *     description: Retorna la reserva activa del usuario autenticado, si existe.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reserva activa encontrada
 *         content:
 *           application/json:
 *             example:
 *               id: 10
 *               user_id: 3
 *               station_id: 5
 *               bike_id: 8
 *               status: "active"
 *               start_time: "2025-11-10T10:00:00Z"
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             example:
 *               message: "No autenticado"
 *       404:
 *         description: No hay reservas activas
 *         content:
 *           application/json:
 *             example:
 *               message: "No se encontró reserva activa"
 */

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

  /**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Crear una nueva reserva
 *     description: Crea una reserva para el usuario autenticado en una estación específica.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stationId
 *             properties:
 *               stationId:
 *                 type: integer
 *                 description: ID de la estación donde se hace la reserva.
 *                 example: 2
 *               bikeType:
 *                 type: string
 *                 description: Tipo de bicicleta (opcional, puede ser eléctrica o normal).
 *                 example: "eléctrica"
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 15
 *               user_id: 3
 *               station_id: 2
 *               status: "active"
 *               start_time: "2025-11-10T10:00:00Z"
 *       400:
 *         description: Faltan parámetros obligatorios
 *         content:
 *           application/json:
 *             example:
 *               message: "stationId es obligatorio"
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             example:
 *               message: "No autenticado"
 *       500:
 *         description: Error interno del servidor
 */

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

  /**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Cancelar una reserva activa
 *     description: Cancela la reserva activa del usuario autenticado según su ID.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 15
 *         description: ID de la reserva a cancelar.
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reserva cancelada exitosamente"
 *       400:
 *         description: ID de reserva inválido
 *         content:
 *           application/json:
 *             example:
 *               message: "Id de reserva inválido"
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             example:
 *               message: "No autenticado"
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             example:
 *               message: "Reserva no encontrada"
 */

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
