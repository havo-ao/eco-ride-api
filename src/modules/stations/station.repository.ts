import { db } from "@/core/database/mysql";
import { RowDataPacket } from "mysql2/promise";

export interface NearestStationRow extends RowDataPacket {
  id: number | string;
  name: string;
  type: string;
  capacity: number | string;
  latitude: number | string;
  longitude: number | string;
  distanceMeters: number | string;
  availableMechanical: number | string;
  availableElectric: number | string;
}

export interface StationWithAvailabilityRow extends RowDataPacket {
  id: number | string;
  name: string;
  type: string;
  capacity: number | string;
  latitude: number | string;
  longitude: number | string;
  availableMechanical: number | string;
  availableElectric: number | string;
}

export class StationRepository {
  async getNearest(
    lat: number,
    lng: number
  ): Promise<NearestStationRow | null> {
    const [rows] = await db.query<NearestStationRow[][]>(
      "CALL sp_get_nearest_station(?, ?)",
      [lat, lng]
    );

    const result = rows[0][0] as NearestStationRow | undefined;
    return result ?? null;
  }

  async getWithAvailability(): Promise<StationWithAvailabilityRow[]> {
    const [rows] = await db.query<StationWithAvailabilityRow[][]>(
      "CALL sp_get_stations_with_availability()"
    );

    const result = rows[0] as StationWithAvailabilityRow[];
    return result;
  }
}
