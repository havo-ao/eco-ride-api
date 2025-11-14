import { Request, Response } from 'express';
import { registerUserService } from '../services/register.service';
import { childLogger } from '@/core/logger/logger';

const logger = childLogger('users-controller');

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Registra un nuevo usuario en el sistema.
 *     description: Crea un nuevo usuario, genera un token de verificación y envía un correo para activar la cuenta.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 example: "paola@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               firstName:
 *                 type: string
 *                 example: "Keysha"
 *               lastName:
 *                 type: string
 *                 example: "Berdugo"
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente. Se envía un correo de verificación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 7
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente"
 *       400:
 *         description: El correo ya está registrado o datos inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "El correo ya está registrado"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
export async function registerUserController(req: Request, res: Response) {
  try {
    const result = await registerUserService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor' });
    logger.error({ message: 'Error en registerUserController', error: (error as Error).message, stack: (error as Error).stack });
  }
}