import { db } from "@/core/database/mysql";
import { RowDataPacket } from "mysql2/promise";

export interface NearestStationRecord {
  id: number;
  name: string;
  type: string;
  capacity: number;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  availableMechanical: number;
  availableElectric: number;
}

export class StationRepository {
  async getNearest(
    lat: number,
    lng: number
  ): Promise<NearestStationRecord | null> {
    const [rows] = await db.query<RowDataPacket[][]>(
      "CALL sp_get_nearest_station(?, ?)",
      [lat, lng]
    );
    const result = rows[0][0] as NearestStationRecord | undefined;
    return result ?? null;
  }
}
