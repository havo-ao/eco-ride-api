import crypto from 'crypto';

/**
 * Genera un token aleatorio en texto plano (para enviar por correo).
 */
export function generateRawToken(): string {
  return crypto.randomBytes(20).toString('hex');
}

/**
 * Hashea un token usando SHA-256 (para guardar en la base de datos).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}