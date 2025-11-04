import { StartRideDTO } from '../dtos/startRide.dto';
import { startRide } from '../repositories/ride.repo';

export async function startRideService(dto: StartRideDTO) {
  return await startRide(dto);
}