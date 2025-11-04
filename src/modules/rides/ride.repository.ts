import { db } from "@/core/database/mysql";
import { RowDataPacket } from "mysql2/promise";

export interface RideRow extends RowDataPacket {
  id: number | string;
  user_id: number | string;
  bike_id: number | string;
  origin_station_id: number | string;
  origin_station_name: string;
  destination_station_id: number | string | null;
  destination_station_name: string | null;
  start_time: string | null;
  end_time: string | null;
  status: "Active" | "Completed" | string;
}

export class RideRepository {
  async getActive(userId: number): Promise<RideRow | null> {
    const [rows] = await db.query<RideRow[][]>("CALL sp_get_active_ride(?)", [
      userId,
    ]);
    const result = rows[0][0] as RideRow | undefined;
    return result ?? null;
  }

  async startRide(
    userId: number,
    reservationId: number,
    bikeId: number
  ): Promise<RideRow> {
    const [rows] = await db.query<RideRow[][]>("CALL sp_start_ride(?, ?, ?)", [
      userId,
      reservationId,
      bikeId,
    ]);
    const result = rows[0][0] as RideRow;
    return result;
  }

  async endRide(
    userId: number,
    rideId: number,
    destinationStationId: number
  ): Promise<RideRow> {
    const [rows] = await db.query<RideRow[][]>("CALL sp_end_ride(?, ?, ?)", [
      userId,
      rideId,
      destinationStationId,
    ]);
    const result = rows[0][0] as RideRow;
    return result;
  }
}
