import { db } from "@/core/database/mysql";
import { RowDataPacket } from "mysql2/promise";

export interface ReservationRecord {
  id: number;
  userId: number;
  bikeId: number;
  stationId: number;
  stationName: string;
  bikeType: string;
  reservedAt: string;
  expiresAt: string;
  status: string;
}

export class ReservationRepository {
  async getActiveReservation(
    userId: number
  ): Promise<ReservationRecord | null> {
    const [rows] = await db.query<RowDataPacket[][]>(
      "CALL sp_get_active_reservation(?)",
      [userId]
    );
    const result = rows[0][0] as ReservationRecord | undefined;
    return result ?? null;
  }

  async createReservation(
    userId: number,
    stationId: number,
    bikeType?: string | null
  ): Promise<ReservationRecord> {
    const [rows] = await db.query<RowDataPacket[][]>(
      "CALL sp_create_reservation(?, ?, ?)",
      [userId, stationId, bikeType ?? null]
    );
    const result = rows[0][0] as ReservationRecord;
    return result;
  }

  async cancelReservation(
    reservationId: number,
    userId: number
  ): Promise<ReservationRecord> {
    const [rows] = await db.query<RowDataPacket[][]>(
      "CALL sp_cancel_reservation(?, ?)",
      [reservationId, userId]
    );
    const result = rows[0][0] as ReservationRecord;
    return result;
  }
}
