import { db } from "../../../core/database/mysql";
import { RowDataPacket } from "mysql2";

export interface UserProfileFine {
  id: number;
  amount: number;
  reason: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: Date;
}

export interface UserProfileRide {
  id: number;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
  status: "IN_PROGRESS" | "FINISHED" | "CANCELLED";
}

export interface UserProfileBase {
  userId: number;
  fullName: string;
  email: string;
  balance: number;
}

export class UserProfileRepository {
  constructor(private readonly dbPool = db) {}

  private async tryQuery<T = any>(sql: string, params: any[] = []): Promise<T[] | null> {
    try {
      const [rows] = await this.dbPool.query<RowDataPacket[]>(sql, params);
      try {
        const len = Array.isArray(rows) ? (rows as any).length : 0;
        console.info('user-profile.repository: query succeeded', { sql, params, rowCount: len });
      } catch {}
      return (rows as unknown) as T[];
    } catch (err) {
      // Query failed (table/column not present) — return null to allow fallbacks
      console.warn('user-profile.repository: query failed, trying fallback', { sql, err: (err as any)?.message });
      return null;
    }
  }

  async findUserProfileBase(userId: number): Promise<UserProfileBase | null> {
    // Try multiple table/column variants to support different DB schemas
    const attempts = [
      // English normalized schema (singular 'user')
      `SELECT u.id AS userId, CONCAT(u.first_name, ' ', u.last_name) AS fullName, u.email FROM user u WHERE u.id = ? LIMIT 1`,
      // English plural (if present)
      `SELECT u.id AS userId, CONCAT(u.first_name, ' ', u.last_name) AS fullName, u.email FROM users u WHERE u.id = ? LIMIT 1`,
      // Spanish legacy schema with full_name
      `SELECT u.id AS userId, u.full_name AS fullName, u.email FROM usuarios u WHERE u.id = ? LIMIT 1`,
    ];

    for (const sql of attempts) {
      const rows = await this.tryQuery(sql, [userId]);
      if (rows && rows.length > 0) {
        const row: any = rows[0];
        return {
          userId: Number(row.userId),
          fullName: row.fullName || `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.full_name || '',
          email: row.email,
          // DB schema currently doesn't have a `balance` column; return 0 by default.
          balance: 0,
        };
      }
    }

    return null;
  }

  async findUserFines(userId: number): Promise<UserProfileFine[]> {
    // Current DB schema doesn't include a fines table; return empty by default.
    // If in the future fines are stored in a table, add queries here.
    return [];
  }

  async findUserLastRides(userId: number): Promise<UserProfileRide[]> {
    const attempts = [
      // English normalized schema (singular table `ride`) - finished rides have end_time NOT NULL
      `SELECT r.id, r.start_time AS startTime, r.end_time AS endTime, r.duration_minutes AS durationMinutes, NULL AS status FROM ride r WHERE r.user_id = ? AND r.end_time IS NOT NULL ORDER BY r.end_time DESC LIMIT 10`,
      // English plural table
      `SELECT r.id, r.start_time AS startTime, r.end_time AS endTime, r.duration_minutes AS durationMinutes, NULL AS status FROM rides r WHERE r.user_id = ? AND r.end_time IS NOT NULL ORDER BY r.end_time DESC LIMIT 10`,
      // Spanish legacy schema
      `SELECT r.id, r.fecha_inicio AS startTime, r.fecha_fin AS endTime, r.duracion_minutos AS durationMinutes, NULL AS status FROM viajes r WHERE r.usuario_id = ? AND r.fecha_fin IS NOT NULL ORDER BY r.fecha_fin DESC LIMIT 10`,
    ];

    for (const sql of attempts) {
      const rows = await this.tryQuery(sql, [userId]);
      if (rows) {
        return (rows || []).map((r: any) => ({
          id: Number(r.id),
          startTime: r.startTime ? new Date(r.startTime) : (r.fecha_inicio ? new Date(r.fecha_inicio) : new Date()),
          endTime: r.endTime ? new Date(r.endTime) : (r.fecha_fin ? new Date(r.fecha_fin) : null),
          durationMinutes: r.durationMinutes !== null && r.durationMinutes !== undefined ? Number(r.durationMinutes) : null,
          status: (r.status || r.estado) as any,
        }));
      }
    }

    return [];
  }
}

export const userProfileRepository = new UserProfileRepository();
