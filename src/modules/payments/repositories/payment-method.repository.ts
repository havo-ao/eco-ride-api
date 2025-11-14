import { db } from "../../../core/database/mysql";
import { CreatePaymentMethodDto } from "../dtos/create-payment-method.dto";
import { RowDataPacket } from "mysql2";

export interface RegisterResult {
  resultCode: number;
  resultMessage: string;
}

export class PaymentMethodRepository {
  public static async registerPaymentMethod(
    userId: number,
    dto: CreatePaymentMethodDto,
    isValid: boolean,
    setAsDefault: boolean
  ): Promise<RegisterResult> {
    const conn = await db.getConnection();
    try {
      // If stripePaymentMethodId provided, ensure we don't already have it for this user
      if (dto.stripePaymentMethodId) {
        const [existing] = await conn.query(
          "SELECT id FROM payment_methods WHERE user_id = ? AND stripe_payment_method_id = ? LIMIT 1",
          [userId, dto.stripePaymentMethodId]
        );
        if ((existing as any[]).length > 0) {
          return { resultCode: 2, resultMessage: 'ALREADY_EXISTS' };
        }
      }

      // Insert new payment method using SQL (no stored procedures)
      const status = isValid ? 'VALID' : 'REJECTED';
      const isDefaultFlag = setAsDefault && isValid ? 1 : 0;

      try {
        await conn.beginTransaction();

        if (isDefaultFlag) {
          await conn.query("UPDATE payment_methods SET is_default = 0 WHERE user_id = ?", [userId]);
        }

        const [insertRes] = await conn.query(
          `INSERT INTO payment_methods (user_id, type, stripe_payment_method_id, brand, last4, exp_month, exp_year, status, is_default, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            userId,
            dto.type,
            dto.stripePaymentMethodId ?? null,
            dto.brand ?? null,
            dto.last4 ?? null,
            dto.expMonth ?? null,
            dto.expYear ?? null,
            status,
            isDefaultFlag,
          ]
        );

        await conn.commit();
        return { resultCode: 0, resultMessage: 'OK' };
      } catch (err) {
        await conn.rollback();
        console.error('registerPaymentMethod error:', (err as Error).message);
        return { resultCode: -1, resultMessage: 'ERROR_INTERNAL' };
      }
    } finally {
      conn.release();
    }
  }

  // Lower-level helper: find by stripe id for a user
  public static async findByStripePaymentMethodId(userId: number, stripePaymentMethodId: string) {
    const [rows] = await db.query(
      `SELECT id, user_id, type, stripe_payment_method_id AS stripePaymentMethodId, brand, last4, exp_month AS expMonth, exp_year AS expYear, status, is_default AS isDefault, created_at AS createdAt
       FROM payment_methods WHERE user_id = ? AND stripe_payment_method_id = ? LIMIT 1`,
      [userId, stripePaymentMethodId]
    );
    const first = (rows as RowDataPacket[])[0] as RowDataPacket | undefined;
    return first || null;
  }

  public static async clearDefaultForUser(userId: number) {
    await db.query("UPDATE payment_methods SET is_default = 0 WHERE user_id = ?", [userId]);
  }

  public static async createPaymentMethod(params: {
    userId: number;
    type: 'CARD' | 'WALLET';
    stripePaymentMethodId?: string | null;
    brand?: string | null;
    last4?: string | null;
    expMonth?: number | null;
    expYear?: number | null;
    status: 'PENDING' | 'VALID' | 'REJECTED';
    isDefault: boolean;
  }) {
    const conn = await db.getConnection();
    try {
      const [insertRes] = await conn.query(
        `INSERT INTO payment_methods (user_id, type, stripe_payment_method_id, brand, last4, exp_month, exp_year, status, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          params.userId,
          params.type,
          params.stripePaymentMethodId ?? null,
          params.brand ?? null,
          params.last4 ?? null,
          params.expMonth ?? null,
          params.expYear ?? null,
          params.status,
          params.isDefault ? 1 : 0,
        ]
      );

      const insertId = (insertRes as any).insertId;
      const [rows] = await db.query(
        `SELECT id, user_id, type, stripe_payment_method_id AS stripePaymentMethodId, brand, last4, exp_month AS expMonth, exp_year AS expYear, status, is_default AS isDefault, created_at AS createdAt
         FROM payment_methods WHERE id = ? LIMIT 1`,
        [insertId]
      );
      return (rows as RowDataPacket[])[0] as RowDataPacket | null;
    } finally {
      conn.release();
    }
  }

  public static async listByUser(userId: number) {
    // Return only enabled (non-revoked) payment methods by default
    const [rows] = await db.query(
      `SELECT id, user_id, type, stripe_payment_method_id AS stripePaymentMethodId, brand, last4, exp_month AS expMonth, exp_year AS expYear, status, is_default AS isDefault, created_at AS createdAt
       FROM payment_methods WHERE user_id = ? AND status != 'REVOKED' ORDER BY created_at DESC`,
      [userId]
    );
    return rows as RowDataPacket[];
  }

  /**
   * Find payment method by id and user.
   * By default excludes revoked methods. Set `includeRevoked` to true to fetch revoked ones as well.
   */
  public static async findById(id: number, userId: number, includeRevoked = false) {
    const sql = `SELECT id, user_id, type, stripe_payment_method_id AS stripePaymentMethodId, brand, last4, exp_month AS expMonth, exp_year AS expYear, status, is_default AS isDefault, created_at AS createdAt
       FROM payment_methods WHERE id = ? AND user_id = ? ${includeRevoked ? '' : "AND status != 'REVOKED'"} LIMIT 1`;
    const [rows] = await db.query(sql, [id, userId]);
    const first = (rows as RowDataPacket[])[0] as RowDataPacket | undefined;
    return first || null;
  }

  public static async setAsDefault(userId: number, paymentMethodId: number) {
    const conn = await db.getConnection();
    try {
      // Check existence
      const [rows] = await conn.query(`SELECT id, user_id FROM payment_methods WHERE id = ? LIMIT 1`, [paymentMethodId]);
      const row = (rows as RowDataPacket[])[0] as RowDataPacket | undefined;
      if (!row) return { resultCode: 2, resultMessage: 'NOT_FOUND' };
      if (Number(row.user_id) !== Number(userId)) return { resultCode: 2, resultMessage: 'NOT_OWNED' };

      try {
        await conn.beginTransaction();
        await conn.query("UPDATE payment_methods SET is_default = 0 WHERE user_id = ?", [userId]);
        const [res] = await conn.query("UPDATE payment_methods SET is_default = 1 WHERE id = ? AND user_id = ?", [paymentMethodId, userId]);
        await conn.commit();
        const affectedRows = (res as any).affectedRows ?? (res as any)[0]?.affectedRows ?? 0;
        if (affectedRows === 0) return { resultCode: 2, resultMessage: 'NOT_OWNED' };
        return { resultCode: 0, resultMessage: 'OK' };
      } catch (err) {
        await conn.rollback();
        console.error('setAsDefault error:', (err as Error).message);
        return { resultCode: -1, resultMessage: 'ERROR_INTERNAL' };
      }
    } finally {
      conn.release();
    }
  }

  // New simpler setDefault helper returning string codes
  public static async setDefault(userId: number, paymentMethodId: number): Promise<'OK' | 'NOT_OWNED' | 'NOT_FOUND' | 'ERROR'> {
    const conn = await db.getConnection();
    try {
      const [rows] = await conn.query(`SELECT id, user_id FROM payment_methods WHERE id = ? LIMIT 1`, [paymentMethodId]);
      const row = (rows as RowDataPacket[])[0] as RowDataPacket | undefined;
      if (!row) return 'NOT_FOUND';
      if (Number(row.user_id) !== Number(userId)) return 'NOT_OWNED';

      try {
        await conn.beginTransaction();
        await conn.query("UPDATE payment_methods SET is_default = 0 WHERE user_id = ?", [userId]);
        const [res] = await conn.query("UPDATE payment_methods SET is_default = 1 WHERE id = ? AND user_id = ?", [paymentMethodId, userId]);
        await conn.commit();
        const affectedRows = (res as any).affectedRows ?? (res as any)[0]?.affectedRows ?? 0;
        if (affectedRows === 0) return 'NOT_OWNED';
        return 'OK';
      } catch (err) {
        await conn.rollback();
        console.error('setDefault error:', (err as Error).message);
        return 'ERROR';
      }
    } finally {
      conn.release();
    }
  }

  public static async revokeById(userId: number, paymentMethodId: number) {
    const conn = await db.getConnection();
    try {
      const [rows] = await conn.query(`SELECT id, user_id FROM payment_methods WHERE id = ? LIMIT 1`, [paymentMethodId]);
      const row = (rows as RowDataPacket[])[0] as RowDataPacket | undefined;
      if (!row) return { resultCode: 2, resultMessage: 'NOT_FOUND' };
      if (Number(row.user_id) !== Number(userId)) return { resultCode: 2, resultMessage: 'NOT_OWNED' };

      const [res] = await conn.query(`UPDATE payment_methods SET status = 'REVOKED', is_default = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [paymentMethodId]);
      return { resultCode: 0, resultMessage: 'OK' };
    } finally {
      conn.release();
    }
  }

  // Delete/revoke by id and user with simple return codes
  public static async deleteByIdAndUser(id: number, userId: number): Promise<'OK' | 'NOT_OWNED' | 'NOT_FOUND'> {
    const conn = await db.getConnection();
    try {
      const [rows] = await conn.query(`SELECT id, user_id FROM payment_methods WHERE id = ? LIMIT 1`, [id]);
      const row = (rows as RowDataPacket[])[0] as RowDataPacket | undefined;
      if (!row) return 'NOT_FOUND';
      if (Number(row.user_id) !== Number(userId)) return 'NOT_OWNED';

      await conn.query(`UPDATE payment_methods SET status = 'REVOKED', is_default = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
      return 'OK';
    } finally {
      conn.release();
    }
  }

  public static async revokeByStripeId(stripePaymentMethodId: string) {
    const conn = await db.getConnection();
    try {
      const [res] = await conn.query(`UPDATE payment_methods SET status = 'REVOKED', is_default = 0, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_method_id = ?`, [stripePaymentMethodId]);
      return { resultCode: 0, resultMessage: 'OK' };
    } finally {
      conn.release();
    }
  }

  public static async updateFromStripe(pm: { id: string; card?: any }) {
    // pm: Stripe.PaymentMethod simplified shape
    const brand = pm.card?.brand ?? null;
    const last4 = pm.card?.last4 ?? null;
    const expMonth = pm.card?.exp_month ?? null;
    const expYear = pm.card?.exp_year ?? null;

    const [result] = await db.query(
      `UPDATE payment_methods SET brand = ?, last4 = ?, exp_month = ?, exp_year = ?, status = 'VALID', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_method_id = ?`,
      [brand, last4, expMonth, expYear, pm.id]
    );

    return result as any;
  }
}
