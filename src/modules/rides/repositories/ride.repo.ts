import { db } from '../../../core/database/mysql';
import { StartRideDTO } from '../dtos/startRide.dto';
import { RowDataPacket } from 'mysql2';

type StartRideResult = RowDataPacket & {
  status: string;
  message: string;
  rideId: number | null;
};

export async function startRide(dto: StartRideDTO) {
  await db.query(
    'CALL sp_start_ride(?, ?, ?, ?, @status, @message, @ride_id)',
    [dto.userId, dto.bikeId, dto.originStationId, dto.type]
  );

  const [rows] = await db.query<StartRideResult[]>(
    'SELECT @status AS status, @message AS message, @ride_id AS rideId'
  );

  return rows[0];
}