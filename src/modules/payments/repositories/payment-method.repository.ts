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
          const existingId = (existing as any[])[0].id;
          // If client requested setAsDefault, call the SP to flip default flags
          if (setAsDefault) {
            try {
              await conn.query("CALL sp_set_default_payment_method(?, ?, @o_result_code, @o_result_message)", [userId, existingId]);
              // ignore SP result here — caller will receive OK_ALREADY_EXISTS
            } catch (e) {
              // ignore
            }
          }

          return { resultCode: 0, resultMessage: 'OK_ALREADY_EXISTS' };
        }
      }
      const callSql =
        "CALL sp_register_payment_method(?,?,?,?,?,?,?,?,?, @o_result_code, @o_result_message)";

      await conn.query(callSql, [
        userId,
        dto.type,
        dto.stripePaymentMethodId ?? null,
        dto.brand ?? null,
        dto.last4 ?? null,
        dto.expMonth ?? null,
        dto.expYear ?? null,
        isValid ? 1 : 0,
        setAsDefault ? 1 : 0,
      ]);

      

      const [selectRows] = await conn.query("SELECT @o_result_code AS resultCode, @o_result_message AS resultMessage");

      const firstRow = (selectRows as RowDataPacket[])[0] as { resultCode: number; resultMessage: string } | undefined;

      if (!firstRow) {
        return { resultCode: -1, resultMessage: "NO_RESPONSE" };
      }

      return { resultCode: Number(firstRow.resultCode), resultMessage: String(firstRow.resultMessage) };
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
      const callSql = "CALL sp_set_default_payment_method(?, ?, @o_result_code, @o_result_message)";
      await conn.query(callSql, [userId, paymentMethodId]);
      const [selectRows] = await conn.query("SELECT @o_result_code AS resultCode, @o_result_message AS resultMessage");
      const firstRow = (selectRows as RowDataPacket[])[0] as { resultCode: number; resultMessage: string } | undefined;
      if (!firstRow) return { resultCode: -1, resultMessage: 'NO_RESPONSE' };
      return { resultCode: Number(firstRow.resultCode), resultMessage: String(firstRow.resultMessage) };
    } finally {
      conn.release();
    }
  }

  public static async revokeById(userId: number, paymentMethodId: number) {
    const conn = await db.getConnection();
    try {
      const callSql = "CALL sp_revoke_payment_method(?, ?, @o_result_code, @o_result_message)";
      await conn.query(callSql, [userId, paymentMethodId]);
      const [selectRows] = await conn.query("SELECT @o_result_code AS resultCode, @o_result_message AS resultMessage");
      const firstRow = (selectRows as RowDataPacket[])[0] as { resultCode: number; resultMessage: string } | undefined;
      if (!firstRow) return { resultCode: -1, resultMessage: 'NO_RESPONSE' };
      return { resultCode: Number(firstRow.resultCode), resultMessage: String(firstRow.resultMessage) };
    } finally {
      conn.release();
    }
  }

  public static async revokeByStripeId(stripePaymentMethodId: string) {
    const conn = await db.getConnection();
    try {
      const callSql = "CALL sp_revoke_payment_method_by_stripe_id(?, @o_result_code, @o_result_message)";
      await conn.query(callSql, [stripePaymentMethodId]);
      const [selectRows] = await conn.query("SELECT @o_result_code AS resultCode, @o_result_message AS resultMessage");
      const firstRow = (selectRows as RowDataPacket[])[0] as { resultCode: number; resultMessage: string } | undefined;
      if (!firstRow) return { resultCode: -1, resultMessage: 'NO_RESPONSE' };
      return { resultCode: Number(firstRow.resultCode), resultMessage: String(firstRow.resultMessage) };
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
