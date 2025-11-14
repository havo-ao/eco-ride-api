import { db } from "../../../core/database/mysql";
import { RegisterUserDTO } from "../dtos/register.dto";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

type RegisterResult = RowDataPacket & {
  status: string;
  message: string;
  userId: number | null;
};
export async function registerUser(dto: RegisterUserDTO) {
  const passwordHash = await bcrypt.hash(dto.password, 10);

  // Support optional hashedToken and tokenExpiration passed in dto
  // Call stored procedure with the additional parameters if provided
  // We'll pass NULL for token params if not provided
  const hashedTokenParam = dto.hashedToken ?? null;
  const tokenExpirationParam = dto.tokenExpiration ? String(dto.tokenExpiration) : null;

  await db.query(
    "CALL sp_register_user(?, ?, ?, ?, ?, ?, @status, @message, @user_id)",
    [dto.email, passwordHash, dto.firstName, dto.lastName, hashedTokenParam, tokenExpirationParam]
  );

  const [rows] = await db.query<RegisterResult[]>(
    "SELECT @status AS status, @message AS message, @user_id AS userId"
  );

  return rows[0];
}

export async function getUserById(userId: number) {
  // Try `usuarios` first (older migrations), fall back to `user` if not present or no rows
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, email, stripe_customer_id FROM usuarios WHERE id = ?",
      [userId]
    );

    if ((rows as any[]).length > 0) return (rows as any[])[0];
  } catch (err: any) {
    // If table doesn't exist, we'll try the other table below. Otherwise rethrow.
    if (err && err.code !== "ER_NO_SUCH_TABLE") throw err;
  }

  // Try `user` table as fallback
  try {
    const [rows2] = await db.query<RowDataPacket[]>(
      "SELECT id, email, stripe_customer_id FROM `user` WHERE id = ?",
      [userId]
    );
    return (rows2 as any[])[0] || null;
  } catch (err: any) {
    if (err && err.code === "ER_NO_SUCH_TABLE") {
      // No users table found — return null so callers can handle gracefully
      return null;
    }
    throw err;
  }
}

export async function setStripeCustomerId(userId: number, stripeCustomerId: string) {
  // Attempt to update `usuarios`, fall back to `user` if needed
  try {
    const [res]: any = await db.query("UPDATE usuarios SET stripe_customer_id = ? WHERE id = ?", [stripeCustomerId, userId]);
    if (res && res.affectedRows > 0) return true;
  } catch (err: any) {
    if (err && err.code !== "ER_NO_SUCH_TABLE") throw err;
  }

  try {
    const [res2]: any = await db.query("UPDATE `user` SET stripe_customer_id = ? WHERE id = ?", [stripeCustomerId, userId]);
    if (res2 && res2.affectedRows > 0) return true;
    } catch (err: any) {
    if (err && err.code === "ER_NO_SUCH_TABLE") {
      return false;
    }
    throw err;
  }

  // If neither update affected rows, return false so caller can act accordingly
  return false;
}

 
