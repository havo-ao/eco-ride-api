import { callProc, queryOne } from '../../../core/database/mysql';

export const paymentsRepo = {
  async saveValidPaymentMethod(
    userId: number,
    stripeCustomerId: string,
    stripePaymentMethodId: string
  ): Promise<void> {
    await callProc('sp_payment_methods_upsert_valid', [userId, stripeCustomerId, stripePaymentMethodId]);
  },

  async markPaymentMethodRejected(userId: number, reason: string): Promise<void> {
    await callProc('sp_payment_methods_mark_rejected', [userId, reason]);
  },

  async hasValidPaymentMethod(userId: number): Promise<boolean> {
    const row = await queryOne<{ has_valid: number }>(
      'SELECT fn_user_has_valid_pm(?) AS has_valid',
      [userId]
    );
    return (row?.has_valid || 0) === 1;
  },
};
