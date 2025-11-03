import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../../src/core/database/mysql';

// ✅ Saltar integración en CI (GitHub Actions)
if (process.env.CI) {
  describe.skip('SP: sp_register_user (Integración)', () => {});
} else {
  describe('SP: sp_register_user (Integración)', () => {
    beforeAll(async () => {
      await db.query('DELETE FROM usuarios WHERE email LIKE "test%"');
    });

    afterAll(async () => {
      await db.end();
    });

    it('debe registrar un usuario nuevo', async () => {
      await db.query('CALL sp_register_user(?, ?, ?, @status, @message, @user_id)', [
        'test@example.com',
        'hashed_password',
        'Test User'
      ]);

      const [rows] = await db.query(
        'SELECT @status AS status, @message AS message, @user_id AS userId'
      );
      const result = (rows as any)[0];

      expect(result.status).toBe('OK');
      expect(result.message).toContain('Usuario registrado exitosamente');
      expect(result.userId).toBeGreaterThan(0);
    });

    it('debe fallar si el correo ya existe', async () => {
      await db.query('CALL sp_register_user(?, ?, ?, @status, @message, @user_id)', [
        'test@example.com',
        'hashed_password',
        'Test User'
      ]);

      const [rows] = await db.query(
        'SELECT @status AS status, @message AS message, @user_id AS userId'
      );
      const result = (rows as any)[0];

      expect(result.status).toBe('ERROR');
      expect(result.message).toContain('El correo ya está registrado');
      expect(result.userId).toBeNull();
    });
  });
}