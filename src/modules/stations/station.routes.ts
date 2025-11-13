import { Router } from "express";
import { StationController } from "./station.controller";

const router = Router();
/**
 * @swagger
 * /api/stations/nearest:
 *   get:
 *     summary: Obtener estación más cercana
 *     description: Devuelve la estación más cercana a las coordenadas proporcionadas (latitud y longitud).
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           example: 4.6097
 *         description: Latitud actual del usuario.
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           example: -74.0817
 *         description: Longitud actual del usuario.
 *     responses:
 *       200:
 *         description: Estación más cercana encontrada
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               name: "Estación Parque Central"
 *               latitude: 4.6102
 *               longitude: -74.0815
 *               available_bikes: 5
 *               available_docks: 10
 *       400:
 *         description: Parámetros inválidos o faltantes
 *         content:
 *           application/json:
 *             example:
 *               message: "Parámetros lat y lng deben ser numéricos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               message: "Error interno del servidor"
 */


router.get("/nearest", StationController.getNearest);
router.get("/with-availability", StationController.getWithAvailability);

export default router;
