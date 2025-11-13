import { Request, Response } from 'express';
import { db } from '../../../core/database/mysql';
import crypto from 'crypto';

/**
 * @swagger
 * /api/auth/activate/{token}:
 *   get:
 *     summary: Activa la cuenta de un usuario.
 *     description: Verifica el token de activación recibido por correo y activa la cuenta del usuario si el token es válido.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de activación enviado al correo del usuario.
 *     responses:
 *       200:
 *         description: Cuenta activada exitosamente o ya estaba activa.
 *         content:
 *           application/json:
 *             example:
 *               message: "Cuenta activada exitosamente."
 *               code: "ACTIVATED"
 *       400:
 *         description: Token inválido o expirado.
 *         content:
 *           application/json:
 *             examples:
 *               invalid:
 *                 summary: Token inválido
 *                 value:
 *                   message: "Token inválido."
 *                   code: "INVALID_TOKEN"
 *               expired:
 *                 summary: Token expirado
 *                 value:
 *                   message: "El enlace de activación ha expirado."
 *                   code: "TOKEN_EXPIRED"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error interno del servidor."
 *               code: "SERVER_ERROR"
 */

export async function activateUserController(req: Request, res: Response) {
  const rawToken = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  try {
    // Buscar usuario por token (sin filtrar is_active)
    const [rows]: any = await db.query(
      'SELECT id, is_active, token_expiration FROM user WHERE verification_token = ?',
      [hashedToken]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido.', code: 'INVALID_TOKEN' });
    }

    const user = rows[0];
    const now = new Date();

    // Si ya está activa
    if (user.is_active) {
      return res.status(200).json({ message: 'Cuenta ya estaba activada.', code: 'ALREADY_ACTIVE' });
    }

    // Si expiró
    if (new Date(user.token_expiration) < now) {
      return res.status(400).json({ message: 'El enlace de activación ha expirado.', code: 'TOKEN_EXPIRED' });
    }

    // Activar cuenta
    await db.query(
      'UPDATE user SET is_active = TRUE, verification_token = NULL, token_expiration = NULL WHERE id = ?',
      [user.id]
    );

    return res.status(200).json({ message: 'Cuenta activada exitosamente.', code: 'ACTIVATED' });
  } catch (error) {
    console.error('Error al activar la cuenta:', error);
    return res.status(500).json({ message: 'Error interno del servidor.', code: 'SERVER_ERROR' });
  }
}