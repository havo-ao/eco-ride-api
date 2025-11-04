import {
  StationRepository,
  NearestStationRow,
  StationWithAvailabilityRow,
} from "./station.repository";

export type StationType = "Residential" | "Metro" | "Financial Center";

export interface NearestStationRecord {
  id: number;
  name: string;
  type: StationType;
  capacity: number;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  availableMechanical: number;
  availableElectric: number;
}

export interface StationWithAvailabilityRecord {
  id: number;
  name: string;
  type: StationType;
  capacity: number;
  latitude: number | null;
  longitude: number | null;
  availableMechanical: number;
  availableElectric: number;
}

export class StationService {
  private readonly repository = new StationRepository();

  async getNearest(
    lat: number,
    lng: number
  ): Promise<NearestStationRecord | null> {
    const row = await this.repository.getNearest(lat, lng);
    if (!row) return null;

    return {
      id: Number(row.id),
      name: row.name,
      type: row.type as StationType,
      capacity: Number(row.capacity),
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      distanceMeters: Number(row.distanceMeters),
      availableMechanical: Number(row.availableMechanical),
      availableElectric: Number(row.availableElectric),
    };
  }

  async getWithAvailability(): Promise<StationWithAvailabilityRecord[]> {
    const rows = await this.repository.getWithAvailability();
    return rows.map((row: StationWithAvailabilityRow) => ({
      id: Number(row.id),
      name: row.name,
      type: row.type as StationType,
      capacity: Number(row.capacity),
      latitude: row.latitude === null ? null : Number(row.latitude),
      longitude: row.longitude === null ? null : Number(row.longitude),
      availableMechanical: Number(row.availableMechanical),
      availableElectric: Number(row.availableElectric),
    }));
  }
}
