import { db } from "@/core/database/mysql";
import { RowDataPacket } from "mysql2/promise";

export interface LoyaltyRow extends RowDataPacket {
  id: number;
  user_id: number;
  points: number;
  description: string;
  created_at: string;
}

export class LoyaltyRepository {
  async addPoints(userId: number, points: number, description: string) {
    await db.query("CALL sp_add_points(?, ?, ?)", [
      userId,
      points,
      description
    ]);
  }

  async redeemPoints(userId: number, points: number) {
    const [rows] = await db.query<LoyaltyRow[][]>(
      "CALL sp_redeem_points(?, ?)",
      [userId, points]
    );
    return rows[0][0];
  }

  async getHistory(userId: number): Promise<LoyaltyRow[]> {
    const [rows] = await db.query<LoyaltyRow[][]>(
      "CALL sp_get_loyalty_history(?)",
      [userId]
    );
    return rows[0];
  }

  async getBalance(userId: number): Promise<number> {
    const [rows] = await db.query<RowDataPacket[][]>(
      "CALL sp_get_loyalty_balance(?)",
      [userId]
    );
    return rows[0][0].balance;
  }
}
