import { describe, it, expect, vi } from 'vitest';
import { registerUser } from '../../../src/modules/users/repositories/users.repo';

vi.mock('../../../src/core/database/mysql', () => ({
  db: {
    query: vi.fn(),
  },
}));

describe('registerUser Repo', () => {
  it('debe llamar al SP y leer variables de salida correctamente', async () => {
    const mockQuery = vi.fn()
      .mockResolvedValueOnce([[{ status: 'OK', message: 'Usuario registrado', userId: 1 }]]) // SP
      .mockResolvedValueOnce([[{ status: 'OK', message: 'Usuario registrado', userId: 1 }]]); // SELECT

    const { db } = await import('../../../src/core/database/mysql');
    (db.query as any) = mockQuery;

    const dto = { email: 'test@example.com', password: '123456', fullName: 'Test User' };
    const result = await registerUser(dto);

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery).toHaveBeenNthCalledWith(
      1,
      'CALL sp_register_user(?, ?, ?, @status, @message, @user_id)',
      [dto.email, expect.any(String), dto.fullName]
    );
    expect(mockQuery).toHaveBeenNthCalledWith(
      2,
      'SELECT @status AS status, @message AS message, @user_id AS userId'
    );
    expect(result.status).toBe('OK');
    expect(result.message).toBe('Usuario registrado');
    expect(result.userId).toBe(1);
  });
});