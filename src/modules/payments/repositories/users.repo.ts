import { query } from '../../../core/database/mysql';

export const usersRepo = {
  async getStripeCustomerId(userId: number): Promise<string | null> {
    try {
      const rows = await query<{ stripe_customer_id: string }>(
        'SELECT stripe_customer_id FROM users WHERE id = ?',
        [userId]
      );
      const row = Array.isArray(rows) ? rows[0] : rows;
      return row?.stripe_customer_id ?? null;
    } catch (err: any) {
      // Añadir contexto y rethrow para que el controlador lo loguee
      throw new Error(`usersRepo.getStripeCustomerId failed for user=${userId}: ${err?.message || err}`);
    }
  },

  async setStripeCustomerId(userId: number, customerId: string): Promise<void> {
    await query(
      'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
      [customerId, userId]
    );
  },
};
