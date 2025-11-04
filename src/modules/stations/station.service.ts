import { StationRepository, NearestStationRecord } from "./station.repository";

export class StationService {
  private readonly repository = new StationRepository();

  async getNearest(
    lat: number,
    lng: number
  ): Promise<NearestStationRecord | null> {
    return this.repository.getNearest(lat, lng);
  }
}
