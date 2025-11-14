import { Request, Response } from "express";
import { loyaltyService } from "./loyalty.service";
export class LoyaltyController {

    /**
 * @swagger
 * /api/loyalty/balance:
 *   get:
 *     summary: Obtener balance actual de puntos
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance actual del usuario
 *         content:
 *           application/json:
 *             example:
 *               balance: 120
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             example:
 *               message: "No autenticado"
 */

  static async getBalance(req: any, res: Response) {
    const userId = req.user.id;
    const balance = await loyaltyService.getBalance(userId);
    return res.json({ balance });
  }

  /**
 * @swagger
 * /api/loyalty/history:
 *   get:
 *     summary: Obtener historial de puntos del usuario
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de puntos
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 user_id: 5
 *                 points: 10
 *                 description: "Viaje completado"
 *                 created_at: "2025-02-03 13:20:00"
 *               - id: 2
 *                 user_id: 5
 *                 points: -5
 *                 description: "Redención"
 *                 created_at: "2025-02-05 10:00:00"
 *       401:
 *         description: Usuario no autenticado
 */

  static async getHistory(req: any, res: Response) {
    const userId = req.user.id;
    const history = await loyaltyService.getHistory(userId);
    return res.json(history);
  }

  /**
 * @swagger
 * /api/loyalty/redeem:
 *   post:
 *     summary: Canjear puntos por descuentos
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       200:
 *         description: Canje exitoso
 *         content:
 *           application/json:
 *             example:
 *               balance: 80
 *       400:
 *         description: Puntos inválidos
 *         content:
 *           application/json:
 *             example:
 *               message: "Puntos inválidos"
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno o puntos insuficientes
 */

  static async redeem(req: any, res: Response) {
    const userId = req.user.id;
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ message: "Puntos inválidos" });
    }

    const result = await loyaltyService.redeemPoints(userId, points);
    return res.json(result);
  }
}
