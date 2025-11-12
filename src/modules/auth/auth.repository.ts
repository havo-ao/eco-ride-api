import { db } from "../../core/database/mysql";
import { RowDataPacket } from "mysql2/promise";

export interface LoginUserRecord {
  id: number;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

export class AuthRepository {
 async findByEmail(email: string): Promise<LoginUserRecord | null> {
  const [rows] = await db.query<RowDataPacket[][]>("CALL sp_login_user(?)", [email]);

  const result = rows[0][0] as
    | { id: number | string; email: string; passwordHash: string; isActive: number }
    | undefined;

  if (!result) {
    return null;
  }

  return {
    id: Number(result.id),
    email: result.email,
    passwordHash: result.passwordHash,
    isActive: Boolean(result.isActive), 
  };
}
}
