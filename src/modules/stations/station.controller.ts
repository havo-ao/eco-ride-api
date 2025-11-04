import { Request, Response, NextFunction } from "express";
import { StationService } from "./station.service";

const service = new StationService();

export class StationController {
  static async getNearest(req: Request, res: Response, next: NextFunction) {
    try {
      const latRaw = req.query.lat;
      const lngRaw = req.query.lng;

      if (typeof latRaw !== "string" || typeof lngRaw !== "string") {
        return res
          .status(400)
          .json({ message: "Parámetros lat y lng son obligatorios" });
      }

      const lat = Number(latRaw);
      const lng = Number(lngRaw);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res
          .status(400)
          .json({ message: "Parámetros lat y lng deben ser numéricos" });
      }

      const station = await service.getNearest(lat, lng);

      if (!station) {
        return res.status(200).json(null);
      }

      return res.json(station);
    } catch (error) {
      return next(error);
    }
  }
}
