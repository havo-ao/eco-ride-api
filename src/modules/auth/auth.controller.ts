import { Request, Response, NextFunction } from "express";
import { AuthService, AuthError } from "./auth.service";

const service = new AuthService();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     description: Permite que un usuario inicie sesión proporcionando su email y contraseña. Retorna un token JWT si las credenciales son correctas.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: 1
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *       400:
 *         description: Faltan campos o datos inválidos
 *         content:
 *           application/json:
 *             example:
 *               message: "Email y contraseña son obligatorios"
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             example:
 *               message: "Email o contraseña incorrectos"
 *               code: "INVALID_CREDENTIALS"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               message: "Error interno del servidor"
 */

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email y contraseña son obligatorios" });
      }
      const result = await service.login(email, password);
      return res.json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return next(error);
    }
  }
}
