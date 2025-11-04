import { db } from "../../core/database/mysql";
import { RowDataPacket } from "mysql2/promise";

export interface LoginUserRecord {
  id: number;
  email: string;
}

export class AuthRepository {
  async login(email: string, password: string): Promise<LoginUserRecord> {
    const [rows] = await db.query<RowDataPacket[][]>(
      "CALL sp_login_user(?, ?)",
      [email, password]
    );
    const result = rows[0][0] as LoginUserRecord | undefined;
    if (!result) {
      throw new Error("INVALID_CREDENTIALS");
    }
    return result;
  }
}
