import { Request, Response, NextFunction } from "express";
import { RideService } from "./ride.service";
import { AuthPayload } from "@/core/middleware/authMiddleware";

const service = new RideService();

interface AuthRequest extends Request {
  user?: AuthPayload;
}

  /**
   * @swagger
   * /rides/active:
   *   get:
   *     summary: Obtiene el viaje activo del usuario autenticado
   *     description: Retorna la información del viaje activo del usuario actualmente autenticado.
   *     tags: [Rides]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Viaje activo obtenido correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               example:
   *                 id: 12
   *                 userId: 5
   *                 bikeId: 8
   *                 status: "active"
   *                 startTime: "2025-11-11T14:00:00Z"
   *       401:
   *         description: No autenticado.
   */
export class RideController {
  static async getActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const ride = await service.getActiveRide(req.user.id);
      return res.json(ride);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /rides/start:
   *   post:
   *     summary: Inicia un viaje con una bicicleta reservada
   *     description: Permite al usuario autenticado iniciar un viaje con una bicicleta disponible.
   *     tags: [Rides]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - reservationId
   *               - bikeId
   *             properties:
   *               reservationId:
   *                 type: integer
   *                 example: 4
   *               bikeId:
   *                 type: integer
   *                 example: 7
   *     responses:
   *       201:
   *         description: Viaje iniciado correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               example:
   *                 id: 22
   *                 userId: 5
   *                 bikeId: 7
   *                 startTime: "2025-11-11T14:10:00Z"
   *                 status: "active"
   *       400:
   *         description: Datos inválidos o faltantes.
   *       401:
   *         description: No autenticado.
   */
  static async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const { reservationId, bikeId } = req.body ?? {};

      if (
        typeof reservationId !== "number" ||
        !Number.isFinite(reservationId) ||
        typeof bikeId !== "number" ||
        !Number.isFinite(bikeId)
      ) {
        return res.status(400).json({
          message:
            "reservationId y bikeId son obligatorios y deben ser numéricos",
        });
      }

      const ride = await service.startRide(req.user.id, {
        reservationId,
        bikeId,
      });

      return res.status(201).json(ride);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /rides/{id}/end:
   *   post:
   *     summary: Finaliza un viaje activo
   *     description: El usuario autenticado finaliza un viaje, indicando la estación de destino.
   *     tags: [Rides]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           example: 22
   *         description: ID del viaje que se desea finalizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - destinationStationId
   *             properties:
   *               destinationStationId:
   *                 type: integer
   *                 example: 10
   *     responses:
   *       200:
   *         description: Viaje finalizado correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               example:
   *                 id: 22
   *                 status: "completed"
   *                 endTime: "2025-11-11T15:00:00Z"
   *                 destinationStationId: 10
   *       400:
   *         description: Datos inválidos.
   *       401:
   *         description: No autenticado.
   */

  static async end(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const rideIdRaw = req.params.id;
      const { destinationStationId } = req.body ?? {};

      const rideId = Number(rideIdRaw);

      if (!rideIdRaw || Number.isNaN(rideId)) {
        return res
          .status(400)
          .json({ message: "El id del viaje debe ser numérico" });
      }

      if (
        typeof destinationStationId !== "number" ||
        !Number.isFinite(destinationStationId)
      ) {
        return res.status(400).json({
          message: "destinationStationId es obligatorio y debe ser numérico",
        });
      }

      const ride = await service.endRide(req.user.id, {
        rideId,
        destinationStationId,
      });

      return res.json(ride);
    } catch (error) {
      return next(error);
    }
  }
}
