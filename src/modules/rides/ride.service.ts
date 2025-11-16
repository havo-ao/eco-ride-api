import { RideRepository, RideRow } from "./ride.repository";
import { loyaltyService } from "../loyalty/loyalty.service";
import { TelemetryService } from "../telemetry/telemetry.service";


export type RideStatus = "Active" | "Completed";

export interface RideRecord {
  id: number;
  userId: number;
  bikeId: number;
  originStationId: number;
  originStationName: string;
  destinationStationId: number | null;
  destinationStationName: string | null;
  startTime: string | null;
  endTime: string | null;
  status: RideStatus;
}

export interface StartRideInput {
  reservationId: number;
  bikeId: number;
}

export interface EndRideInput {
  rideId: number;
  destinationStationId: number;
}

export class RideService {
  private readonly repository = new RideRepository();
  private readonly telemetry = new TelemetryService();

  private mapRowToRecord(row: RideRow): RideRecord {
    return {
      id: Number(row.id),
      userId: Number(row.user_id),
      bikeId: Number(row.bike_id),
      originStationId: Number(row.origin_station_id),
      originStationName: row.origin_station_name,
      destinationStationId:
        row.destination_station_id === null
          ? null
          : Number(row.destination_station_id),
      destinationStationName: row.destination_station_name,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status as RideStatus,
    };
  }

  async getActiveRide(userId: number): Promise<RideRecord | null> {
    const row = await this.repository.getActive(userId);
    if (!row) return null;
    return this.mapRowToRecord(row);
  }

  async startRide(userId: number, input: StartRideInput): Promise<RideRecord> {
    const row = await this.repository.startRide(
      userId,
      input.reservationId,
      input.bikeId
    );
    const ride = this.mapRowToRecord(row);
    
    await this.telemetry.sendLockEvent("unlock", {
      bikeId: ride.bikeId,
      rideId: ride.id,
      userId: ride.userId,
    });

    return ride;
  }

  async endRide(userId: number, input: EndRideInput): Promise<RideRecord> {
    const row = await this.repository.endRide(
      userId,
      input.rideId,
      input.destinationStationId
    );

    const ride = this.mapRowToRecord(row);

    await this.telemetry.sendLockEvent("lock", {
      bikeId: ride.bikeId,
      rideId: ride.id,
      userId: ride.userId,
    });

    await loyaltyService.addPoints(
      userId,
      10, // cantidad de puntos por viaje
      "Puntos por viaje completado"
    );

    return ride;
  }
}
