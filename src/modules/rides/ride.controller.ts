import { Request, Response, NextFunction } from "express";
import { RideService } from "./ride.service";
import { AuthPayload } from "@/core/middleware/authMiddleware";

const service = new RideService();

interface AuthRequest extends Request {
  user?: AuthPayload;
}

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
